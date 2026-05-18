import { index, pgTable, uuid } from 'drizzle-orm/pg-core';
import { permissionTargetEnum, timestamps } from './_shared';
import { organizations } from './organizations';
import { resources } from './resources';
import { roles } from './roles';
import { users } from './users';

export const permissions = pgTable(
  'permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resources.id, { onDelete: 'cascade' }),
    target: permissionTargetEnum('target').notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    ...timestamps,
  },
  (table) => ({
    userIdx: index('permissions_user_id_idx').on(table.userId),
    roleIdx: index('permissions_role_id_idx').on(table.roleId),
    organizationIdx: index('permissions_organization_id_idx').on(table.organizationId),
    resourceIdx: index('permissions_resource_id_idx').on(table.resourceId),
  })
);
