import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './_shared';
import { users } from './users';

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    keyPrefix: text('key_prefix').notNull(),
    keyHash: text('key_hash').notNull(),
    scopes: jsonb('scopes')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    lastUsedAt: timestamp('last_used_at', { mode: 'date' }),
    expiresAt: timestamp('expires_at', { mode: 'date' }),
    revokedAt: timestamp('revoked_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    keyHashIdx: uniqueIndex('api_keys_key_hash_idx').on(table.keyHash),
    keyPrefixIdx: index('api_keys_key_prefix_idx').on(table.keyPrefix),
    createdByIdx: index('api_keys_created_by_id_idx').on(table.createdById),
    revokedAtIdx: index('api_keys_revoked_at_idx').on(table.revokedAt),
  })
);
