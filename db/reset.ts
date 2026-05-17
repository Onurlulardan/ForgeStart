import 'dotenv/config';

import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createNodeDb } from './node';
import { seedDatabase } from './seed';

async function main() {
  const { db, pool } = createNodeDb();

  try {
    await db.execute(sql`drop schema if exists public cascade`);
    await db.execute(sql`create schema public`);
    await db.execute(sql`grant all on schema public to public`);
    await migrate(db, { migrationsFolder: './drizzle' });
    await seedDatabase(db);
    console.log('Database reset completed');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Database reset failed:', error);
  process.exit(1);
});
