import 'dotenv/config';

import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { Pool } from 'pg';
import { createNodeDb } from './node';
import { seedDatabase } from './seed';

async function resetSchema() {
  const { db, pool } = createNodeDb();

  try {
    await db.execute(sql`drop schema if exists drizzle cascade`);
    await db.execute(sql`drop schema if exists public cascade`);
    await db.execute(sql`create schema public`);
    await db.execute(sql`grant all on schema public to public`);
  } finally {
    await pool.end();
  }
}

async function assertRequiredTables(pool: Pool) {
  const result = await pool.query<{
    app_settings: string | null;
    resources: string | null;
  }>(`
    select
      to_regclass('public.app_settings')::text as app_settings,
      to_regclass('public.resources')::text as resources
  `);
  const row = result.rows[0];
  const missing: string[] = [];

  if (!row?.app_settings) {
    missing.push('app_settings');
  }

  if (!row?.resources) {
    missing.push('resources');
  }

  if (missing.length > 0) {
    throw new Error(
      `Database migrations did not create required table(s): ${missing.join(', ')}`
    );
  }
}

async function migrateDatabase() {
  const { db, pool } = createNodeDb();

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    await assertRequiredTables(pool);
  } finally {
    await pool.end();
  }
}

async function seedResetDatabase() {
  const { db, pool } = createNodeDb();

  try {
    await seedDatabase(db);
  } finally {
    await pool.end();
  }
}

async function main() {
  await resetSchema();
  await migrateDatabase();
  await seedResetDatabase();
  console.log('Database reset completed');
}

main().catch((error) => {
  console.error('Database reset failed:', error);
  process.exit(1);
});
