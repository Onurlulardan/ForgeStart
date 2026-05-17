import 'dotenv/config';

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createNodeDb } from './node';

async function main() {
  const { db, pool } = createNodeDb();

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Database migrations applied');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
