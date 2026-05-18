import { sql } from 'drizzle-orm';
import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { storageProviderEnum, timestamps, uploadKindEnum } from './_shared';
import { users } from './users';

export const uploads = pgTable(
  'uploads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
    kind: uploadKindEnum('kind').notNull().default('attachment'),
    provider: storageProviderEnum('provider').notNull().default('local'),
    filename: text('filename').notNull(),
    originalName: text('original_name').notNull(),
    mime: text('mime').notNull(),
    size: integer('size').notNull(),
    path: text('path').notNull(),
    publicUrl: text('public_url'),
    width: integer('width'),
    height: integer('height'),
    thumbnailPath: text('thumbnail_path'),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    ownerIdx: index('uploads_owner_id_idx').on(table.ownerId),
    kindIdx: index('uploads_kind_idx').on(table.kind),
    pathIdx: uniqueIndex('uploads_path_idx').on(table.path),
    deletedAtIdx: index('uploads_deleted_at_idx').on(table.deletedAt),
  })
);
