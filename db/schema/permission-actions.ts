import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './_shared';
import { actions } from './actions';
import { permissions } from './permissions';

export const permissionActions = pgTable(
  'permission_actions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    actionId: uuid('action_id')
      .notNull()
      .references(() => actions.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => ({
    permissionActionIdx: uniqueIndex('permission_actions_permission_action_idx').on(
      table.permissionId,
      table.actionId
    ),
    permissionIdx: index('permission_actions_permission_id_idx').on(table.permissionId),
    actionIdx: index('permission_actions_action_id_idx').on(table.actionId),
  })
);
