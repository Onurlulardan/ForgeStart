import {
  AnyPgColumn,
  index,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { orgStatusEnum, timestamps } from './_shared';
import { users } from './users';

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    status: orgStatusEnum('status').notNull().default('ACTIVE'),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    parentId: uuid('parent_id').references((): AnyPgColumn => organizations.id, {
      onDelete: 'cascade',
    }),
    ...timestamps,
  },
  (table) => ({
    slugIdx: uniqueIndex('organizations_slug_idx').on(table.slug),
    ownerIdx: index('organizations_owner_id_idx').on(table.ownerId),
    parentIdx: index('organizations_parent_id_idx').on(table.parentId),
  })
);
