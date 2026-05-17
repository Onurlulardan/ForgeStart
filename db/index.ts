import 'server-only';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ??
  (process.env.NEXT_PHASE === 'phase-production-build'
    ? 'postgres://nextstarter:nextstarter@localhost:5432/nextstarter'
    : undefined);

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

declare global {
  var __nextstarterPool: Pool | undefined;
}

const pool =
  globalThis.__nextstarterPool ??
  new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__nextstarterPool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
export type Database = typeof db;
