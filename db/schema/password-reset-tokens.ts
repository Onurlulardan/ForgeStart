import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './_shared';
import { users } from './users';

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    usedAt: timestamp('used_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    tokenHashIdx: uniqueIndex('password_reset_tokens_token_hash_idx').on(table.tokenHash),
    userIdx: index('password_reset_tokens_user_id_idx').on(table.userId),
    usedAtIdx: index('password_reset_tokens_used_at_idx').on(table.usedAt),
  })
);
