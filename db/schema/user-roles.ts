import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './_shared';
import { roles } from './roles';
import { users } from './users';

export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => ({
    userRoleIdx: uniqueIndex('user_roles_user_role_idx').on(table.userId, table.roleId),
    userIdx: index('user_roles_user_id_idx').on(table.userId),
    roleIdx: index('user_roles_role_id_idx').on(table.roleId),
  })
);
