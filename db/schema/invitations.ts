import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { invitationStatusEnum, timestamps } from './_shared';
import { organizations } from './organizations';
import { roles } from './roles';
import { users } from './users';

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    tokenHash: text('token_hash').notNull(),
    status: invitationStatusEnum('status').notNull().default('PENDING'),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'set null',
    }),
    invitedById: uuid('invited_by_id').references(() => users.id, { onDelete: 'set null' }),
    acceptedById: uuid('accepted_by_id').references(() => users.id, { onDelete: 'set null' }),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    acceptedAt: timestamp('accepted_at', { mode: 'date' }),
    revokedAt: timestamp('revoked_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    emailIdx: index('invitations_email_idx').on(table.email),
    tokenHashIdx: uniqueIndex('invitations_token_hash_idx').on(table.tokenHash),
    statusIdx: index('invitations_status_idx').on(table.status),
    roleIdx: index('invitations_role_id_idx').on(table.roleId),
    organizationIdx: index('invitations_organization_id_idx').on(table.organizationId),
  })
);
