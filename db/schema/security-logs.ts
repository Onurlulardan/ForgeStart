import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const securityLogs = pgTable(
  'security_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    ipAddress: text('ip_address').notNull(),
    userAgent: text('user_agent').notNull(),
    status: text('status').notNull(),
    type: text('type').notNull(),
    message: text('message').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('security_logs_user_id_idx').on(table.userId),
    createdAtIdx: index('security_logs_created_at_idx').on(table.createdAt),
    statusIdx: index('security_logs_status_idx').on(table.status),
  })
);
