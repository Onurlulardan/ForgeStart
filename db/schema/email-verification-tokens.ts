import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './_shared';
import { users } from './users';

export const emailVerificationTokens = pgTable(
  'email_verification_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    usedAt: timestamp('used_at', { mode: 'date' }),
    sentAt: timestamp('sent_at', { mode: 'date' }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => ({
    tokenHashIdx: uniqueIndex('email_verification_tokens_token_hash_idx').on(table.tokenHash),
    userIdx: index('email_verification_tokens_user_id_idx').on(table.userId),
    usedAtIdx: index('email_verification_tokens_used_at_idx').on(table.usedAt),
  })
);
