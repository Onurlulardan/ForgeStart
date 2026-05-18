import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorEmail: text('actor_email'),
    action: text('action').notNull(),
    resource: text('resource').notNull(),
    resourceId: text('resource_id'),
    status: text('status').notNull().default('SUCCESS'),
    message: text('message').notNull(),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    ipAddress: text('ip_address').notNull().default('0.0.0.0'),
    userAgent: text('user_agent').notNull().default('Unknown'),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    actorIdx: index('audit_logs_actor_id_idx').on(table.actorId),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    resourceIdx: index('audit_logs_resource_idx').on(table.resource),
    statusIdx: index('audit_logs_status_idx').on(table.status),
  })
);
