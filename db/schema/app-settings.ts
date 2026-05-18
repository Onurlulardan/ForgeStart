import { boolean, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './_shared';
import { users } from './users';

export const appSettings = pgTable(
  'app_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: text('key').notNull(),
    value: text('value').notNull(),
    label: text('label').notNull(),
    description: text('description'),
    isSecret: boolean('is_secret').notNull().default(false),
    updatedById: uuid('updated_by_id').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (table) => ({
    keyIdx: uniqueIndex('app_settings_key_idx').on(table.key),
  })
);
