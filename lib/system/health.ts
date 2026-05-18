import packageJson from '@/package.json';
import { pool } from '@/db';
import { env } from '@/env';

export async function getMigrationStatus() {
  const relation = await pool.query<{ exists: string | null }>(
    `select to_regclass('drizzle.__drizzle_migrations') as "exists"`
  );

  if (!relation.rows[0]?.exists) {
    return {
      tableExists: false,
      appliedCount: 0,
      latestMigration: null as string | null,
    };
  }

  const status = await pool.query<{
    appliedCount: number;
    latestMigration: string | null;
  }>(
    `select count(*)::int as "appliedCount", max(hash) as "latestMigration" from drizzle.__drizzle_migrations`
  );

  return {
    tableExists: true,
    appliedCount: status.rows[0]?.appliedCount ?? 0,
    latestMigration: status.rows[0]?.latestMigration ?? null,
  };
}

export async function getHealthStatus() {
  const startedAt = new Date();
  const database = await pool.query<{ ok: number; now: Date }>(`select 1 as ok, now() as "now"`);
  const migrations = await getMigrationStatus();
  const databaseRow = database.rows[0];

  return {
    ok: Boolean(databaseRow?.ok),
    checkedAt: startedAt.toISOString(),
    app: {
      name: packageJson.name,
      version: packageJson.version,
      node: process.version,
      environment: process.env.NODE_ENV ?? 'development',
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? env.GIT_COMMIT_SHA,
    },
    database: {
      connected: Boolean(databaseRow?.ok),
      serverTime: databaseRow?.now?.toISOString?.() ?? null,
      migrations,
    },
  };
}
