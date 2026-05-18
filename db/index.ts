import 'server-only';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env';
import * as schema from './schema';

declare global {
  var __forgestartPool: Pool | undefined;
}

const pool =
  globalThis.__forgestartPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DATABASE_POOL_MAX,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__forgestartPool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
export type Database = typeof db;
