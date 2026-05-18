import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps, userStatusEnum } from './_shared';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name'),
    email: text('email').notNull(),
    emailVerified: timestamp('email_verified', { mode: 'date' }),
    image: text('image'),
    passwordHash: text('password_hash'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phone: text('phone'),
    avatar: text('avatar'),
    avatarUploadId: uuid('avatar_upload_id'),
    status: userStatusEnum('status').notNull().default('ACTIVE'),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    statusIdx: index('users_status_idx').on(table.status),
    avatarUploadIdx: index('users_avatar_upload_id_idx').on(table.avatarUploadId),
  })
);
