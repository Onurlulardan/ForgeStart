import { relations, sql } from 'drizzle-orm';
import {
  AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

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

const timestamps = {
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
};

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

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
    oauth_token_secret: text('oauth_token_secret'),
    oauth_token: text('oauth_token'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
    userIdIdx: index('accounts_user_id_idx').on(table.userId),
  })
);

export const sessions = pgTable(
  'sessions',
  {
    sessionToken: text('session_token').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => ({
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
  })
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  })
);

export const resources = pgTable(
  'resources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    ...timestamps,
  },
  (table) => ({
    slugIdx: uniqueIndex('resources_slug_idx').on(table.slug),
  })
);

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

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => ({
    organizationUserIdx: uniqueIndex('organization_members_organization_user_idx').on(
      table.organizationId,
      table.userId
    ),
    organizationIdx: index('organization_members_organization_id_idx').on(table.organizationId),
    userIdx: index('organization_members_user_id_idx').on(table.userId),
    roleIdx: index('organization_members_role_id_idx').on(table.roleId),
  })
);

export const securityLogs = pgTable(
  'security_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    ipAddress: text('ip_address').notNull(),
    userAgent: text('user_agent').notNull(),
    status: text('status').notNull(),
    type: text('type').notNull(),
    message: text('message').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('security_logs_user_id_idx').on(table.userId),
    createdAtIdx: index('security_logs_created_at_idx').on(table.createdAt),
    statusIdx: index('security_logs_status_idx').on(table.status),
  })
);

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

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    keyPrefix: text('key_prefix').notNull(),
    keyHash: text('key_hash').notNull(),
    scopes: jsonb('scopes')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    lastUsedAt: timestamp('last_used_at', { mode: 'date' }),
    expiresAt: timestamp('expires_at', { mode: 'date' }),
    revokedAt: timestamp('revoked_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    keyHashIdx: uniqueIndex('api_keys_key_hash_idx').on(table.keyHash),
    keyPrefixIdx: index('api_keys_key_prefix_idx').on(table.keyPrefix),
    createdByIdx: index('api_keys_created_by_id_idx').on(table.createdById),
    revokedAtIdx: index('api_keys_revoked_at_idx').on(table.revokedAt),
  })
);

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    tokenHash: text('token_hash').notNull(),
    status: invitationStatusEnum('status').notNull().default('PENDING'),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'set null',
    }),
    invitedById: uuid('invited_by_id').references(() => users.id, { onDelete: 'set null' }),
    acceptedById: uuid('accepted_by_id').references(() => users.id, { onDelete: 'set null' }),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    acceptedAt: timestamp('accepted_at', { mode: 'date' }),
    revokedAt: timestamp('revoked_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    emailIdx: index('invitations_email_idx').on(table.email),
    tokenHashIdx: uniqueIndex('invitations_token_hash_idx').on(table.tokenHash),
    statusIdx: index('invitations_status_idx').on(table.status),
    roleIdx: index('invitations_role_id_idx').on(table.roleId),
    organizationIdx: index('invitations_organization_id_idx').on(table.organizationId),
  })
);

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    usedAt: timestamp('used_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    tokenHashIdx: uniqueIndex('password_reset_tokens_token_hash_idx').on(table.tokenHash),
    userIdx: index('password_reset_tokens_user_id_idx').on(table.userId),
    usedAtIdx: index('password_reset_tokens_used_at_idx').on(table.usedAt),
  })
);

export const emailVerificationTokens = pgTable(
  'email_verification_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    usedAt: timestamp('used_at', { mode: 'date' }),
    sentAt: timestamp('sent_at', { mode: 'date' }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => ({
    tokenHashIdx: uniqueIndex('email_verification_tokens_token_hash_idx').on(table.tokenHash),
    userIdx: index('email_verification_tokens_user_id_idx').on(table.userId),
    usedAtIdx: index('email_verification_tokens_used_at_idx').on(table.usedAt),
  })
);

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

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorEmail: text('actor_email'),
    action: text('action').notNull(),
    resource: text('resource').notNull(),
    resourceId: text('resource_id'),
    status: text('status').notNull().default('SUCCESS'),
    message: text('message').notNull(),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    ipAddress: text('ip_address').notNull().default('0.0.0.0'),
    userAgent: text('user_agent').notNull().default('Unknown'),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    actorIdx: index('audit_logs_actor_id_idx').on(table.actorId),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    resourceIdx: index('audit_logs_resource_idx').on(table.resource),
    statusIdx: index('audit_logs_status_idx').on(table.status),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  userRoles: many(userRoles),
  organizationMemberships: many(organizationMembers),
  permissions: many(permissions),
  securityLogs: many(securityLogs),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  userRoles: many(userRoles),
  organizationMembers: many(organizationMembers),
  permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  resource: one(resources, {
    fields: [permissions.resourceId],
    references: [resources.id],
  }),
  user: one(users, {
    fields: [permissions.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [permissions.roleId],
    references: [roles.id],
  }),
  organization: one(organizations, {
    fields: [permissions.organizationId],
    references: [organizations.id],
  }),
  actions: many(permissionActions),
}));
