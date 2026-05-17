import { relations, sql } from 'drizzle-orm';
import {
  AnyPgColumn,
  boolean,
  index,
  integer,
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
    status: userStatusEnum('status').notNull().default('ACTIVE'),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    statusIdx: index('users_status_idx').on(table.status),
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

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  userRoles: many(userRoles),
  organizationMemberships: many(organizationMembers),
  permissions: many(permissions),
  securityLogs: many(securityLogs),
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
