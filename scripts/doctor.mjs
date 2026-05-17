import 'dotenv/config';

import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Pool } from 'pg';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const checks = [];

function addCheck(name, ok, detail = '') {
  checks.push({ name, ok, detail });
}

for (const file of ['.env', 'compose.yaml', 'drizzle.config.ts', 'yarn.lock']) {
  addCheck(`file:${file}`, existsSync(file), existsSync(file) ? 'present' : 'missing');
}

addCheck(
  'packageManager',
  packageJson.packageManager?.startsWith('yarn@4'),
  packageJson.packageManager
);
addCheck(
  'DATABASE_URL',
  Boolean(process.env.DATABASE_URL),
  process.env.DATABASE_URL ? 'set' : 'missing'
);
addCheck(
  'AUTH_SECRET',
  Boolean(process.env.AUTH_SECRET),
  process.env.AUTH_SECRET ? 'set' : 'missing'
);
addCheck('AUTH_URL', Boolean(process.env.AUTH_URL), process.env.AUTH_URL ?? 'missing');

if (process.env.DATABASE_URL) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 2000,
  });
  try {
    const result = await pool.query(`select now() as now`);
    addCheck('postgres', true, result.rows[0].now.toISOString());

    const migrations = await pool.query(
      `select to_regclass('drizzle.__drizzle_migrations') as migration_table`
    );
    addCheck(
      'drizzle:migrations',
      Boolean(migrations.rows[0].migration_table),
      migrations.rows[0].migration_table ? 'table exists' : 'table missing'
    );
  } catch (error) {
    addCheck('postgres', false, error instanceof Error ? error.message : 'connection failed');
  } finally {
    await pool.end().catch(() => {});
  }
}

const failed = checks.filter((check) => !check.ok);

for (const check of checks) {
  console.log(
    `${check.ok ? 'OK ' : 'ERR'} ${check.name}${check.detail ? ` - ${check.detail}` : ''}`
  );
}

if (failed.length) {
  console.error(`\nDoctor found ${failed.length} issue(s).`);
  process.exit(1);
}

console.log('\nDoctor checks passed.');
