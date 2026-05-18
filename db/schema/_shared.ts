import { pgEnum, timestamp } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const orgStatusEnum = pgEnum('org_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const permissionTargetEnum = pgEnum('permission_target', ['USER', 'ROLE', 'ORGANIZATION']);
export const invitationStatusEnum = pgEnum('invitation_status', [
  'PENDING',
  'ACCEPTED',
  'REVOKED',
  'EXPIRED',
]);
export const storageProviderEnum = pgEnum('storage_provider', ['local', 's3']);
export const uploadKindEnum = pgEnum('upload_kind', [
  'avatar',
  'attachment',
  'rich_text_image',
  'organization_logo',
  'other',
]);

export const timestamps = {
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
};
