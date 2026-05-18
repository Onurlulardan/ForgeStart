import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './_shared';

export const actions = pgTable(
  'actions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    ...timestamps,
  },
  (table) => ({
    slugIdx: uniqueIndex('actions_slug_idx').on(table.slug),
  })
);
