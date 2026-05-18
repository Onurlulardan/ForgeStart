import { sql } from 'drizzle-orm';
import { boolean, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './_shared';
import { organizations } from './organizations';

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    isDefault: boolean('is_default').notNull().default(false),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    ...timestamps,
  },
  (table) => ({
    globalNameIdx: uniqueIndex('roles_global_name_idx')
      .on(table.name)
      .where(sql`${table.organizationId} is null`),
    organizationNameIdx: uniqueIndex('roles_organization_name_idx')
      .on(table.name, table.organizationId)
      .where(sql`${table.organizationId} is not null`),
    nameOrganizationIdx: index('roles_name_organization_idx').on(table.name, table.organizationId),
    organizationIdx: index('roles_organization_id_idx').on(table.organizationId),
  })
);
