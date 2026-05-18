import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './_shared';
import { organizations } from './organizations';
import { roles } from './roles';
import { users } from './users';

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => ({
    organizationUserIdx: uniqueIndex('organization_members_organization_user_idx').on(
      table.organizationId,
      table.userId
    ),
    organizationIdx: index('organization_members_organization_id_idx').on(table.organizationId),
    userIdx: index('organization_members_user_id_idx').on(table.userId),
    roleIdx: index('organization_members_role_id_idx').on(table.roleId),
  })
);
