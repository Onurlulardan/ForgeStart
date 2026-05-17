import 'dotenv/config';

import bcrypt from 'bcryptjs';
import { and, eq, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createNodeDb } from './node';
import * as schema from './schema';
import {
  actions,
  appSettings,
  organizationMembers,
  organizations,
  permissionActions,
  permissions,
  resources,
  roles,
  userRoles,
  users,
} from './schema';

type Db = NodePgDatabase<typeof schema>;

const DEFAULT_RESOURCES = [
  { name: 'ALL', slug: '*', description: 'All resources' },
  { name: 'DASHBOARD', slug: 'dashboard', description: 'Dashboard statistics' },
  { name: 'ORGANIZATION', slug: 'organization', description: 'Organization management' },
  { name: 'USER', slug: 'user', description: 'User management' },
  { name: 'ROLE', slug: 'role', description: 'Role management' },
  { name: 'PERMISSION', slug: 'permission', description: 'Permission management' },
  { name: 'RESOURCE', slug: 'resource', description: 'Resource management' },
  { name: 'ACTION', slug: 'action', description: 'Action management' },
  { name: 'SECURITY LOG', slug: 'security-log', description: 'Security audit logs' },
  { name: 'AUDIT LOG', slug: 'audit-log', description: 'Operational audit logs' },
  { name: 'SETTING', slug: 'setting', description: 'Application settings' },
  { name: 'API KEY', slug: 'api-key', description: 'API key and service account access' },
  { name: 'INVITATION', slug: 'invitation', description: 'User invitation workflow' },
  { name: 'SYSTEM', slug: 'system', description: 'System readiness and health' },
  { name: 'PROFILE', slug: 'profile', description: 'User profile' },
];

const DEFAULT_ACTIONS = [
  { name: 'VIEW', slug: 'view', description: 'Permission to view' },
  { name: 'CREATE', slug: 'create', description: 'Permission to create' },
  { name: 'EDIT', slug: 'edit', description: 'Permission to edit' },
  { name: 'DELETE', slug: 'delete', description: 'Permission to delete' },
  { name: 'MANAGE', slug: 'manage', description: 'Full management permission' },
];

const DEFAULT_ROLES = [
  { name: 'ADMIN', description: 'Full system access', isDefault: false },
  { name: 'ORGANIZATION ADMIN', description: 'Full organization access', isDefault: false },
  { name: 'MEMBER', description: 'Basic member access', isDefault: true },
];

const DEFAULT_SETTINGS = [
  {
    key: 'app.name',
    label: 'Application name',
    value: 'Next Starter V2',
    description: 'Displayed product name for the starter console',
    isSecret: false,
  },
  {
    key: 'app.logo_url',
    label: 'Logo URL',
    value: '',
    description: 'Optional hosted logo URL',
    isSecret: false,
  },
  {
    key: 'app.default_locale',
    label: 'Default locale',
    value: 'en',
    description: 'Default locale for future internationalization',
    isSecret: false,
  },
  {
    key: 'system.welcomeMessage',
    label: 'Welcome message',
    value:
      '<h2>Welcome to your workspace</h2><p>This is rendered as rich text via Tiptap and stored in app_settings.</p>',
    description: 'Rich text message shown to new users (rendered via Tiptap).',
    isSecret: false,
  },
  {
    key: 'auth.session_max_age_days',
    label: 'Session max age',
    value: '7',
    description: 'Default session lifetime in days',
    isSecret: false,
  },
  {
    key: 'email.provider',
    label: 'Email provider',
    value: 'dev-console',
    description: 'Email delivery provider key',
    isSecret: false,
  },
  {
    key: 'storage.provider',
    label: 'Storage provider',
    value: 'url',
    description: 'Storage strategy for uploaded assets',
    isSecret: false,
  },
];

async function upsertResource(db: Db, value: (typeof DEFAULT_RESOURCES)[number]) {
  const [resource] = await db
    .insert(resources)
    .values(value)
    .onConflictDoUpdate({
      target: resources.slug,
      set: {
        name: value.name,
        description: value.description,
        updatedAt: new Date(),
      },
    })
    .returning();

  return resource;
}

async function upsertAction(db: Db, value: (typeof DEFAULT_ACTIONS)[number]) {
  const [action] = await db
    .insert(actions)
    .values(value)
    .onConflictDoUpdate({
      target: actions.slug,
      set: {
        name: value.name,
        description: value.description,
        updatedAt: new Date(),
      },
    })
    .returning();

  return action;
}

async function upsertGlobalRole(db: Db, value: (typeof DEFAULT_ROLES)[number]) {
  const [existing] = await db
    .select()
    .from(roles)
    .where(and(eq(roles.name, value.name), isNull(roles.organizationId)))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(roles)
      .set({
        description: value.description,
        isDefault: value.isDefault,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db.insert(roles).values(value).returning();
  return created;
}

async function upsertSetting(db: Db, value: (typeof DEFAULT_SETTINGS)[number]) {
  await db.insert(appSettings).values(value).onConflictDoNothing({ target: appSettings.key });
}

async function upsertSuperAdmin(db: Db) {
  const email = process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@example.com';
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME ?? 'Super';
  const lastName = process.env.SUPER_ADMIN_LAST_NAME ?? 'Admin';
  const password = process.env.SUPER_ADMIN_PASSWORD ?? 'change-this-password';

  if (process.env.NODE_ENV === 'production' && password === 'change-this-password') {
    throw new Error('SUPER_ADMIN_PASSWORD must be changed before production seeding');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        passwordHash,
        status: 'ACTIVE',
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(users)
    .values({
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      passwordHash,
      status: 'ACTIVE',
      emailVerified: new Date(),
    })
    .returning();

  return created;
}

async function upsertMainOrganization(db: Db, ownerId: string) {
  const [existing] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, 'main-organization'))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(organizations)
      .set({
        name: 'Main Organization',
        status: 'ACTIVE',
        ownerId,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(organizations)
    .values({
      name: 'Main Organization',
      slug: 'main-organization',
      status: 'ACTIVE',
      ownerId,
    })
    .returning();

  return created;
}

export async function seedDatabase(db: Db) {
  await db.transaction(async (tx) => {
    const seededResources = [];
    for (const resource of DEFAULT_RESOURCES) {
      seededResources.push(await upsertResource(tx, resource));
    }

    const seededActions = [];
    for (const action of DEFAULT_ACTIONS) {
      seededActions.push(await upsertAction(tx, action));
    }

    const seededRoles = [];
    for (const role of DEFAULT_ROLES) {
      seededRoles.push(await upsertGlobalRole(tx, role));
    }

    for (const setting of DEFAULT_SETTINGS) {
      await upsertSetting(tx, setting);
    }

    const superAdmin = await upsertSuperAdmin(tx);
    const mainOrganization = await upsertMainOrganization(tx, superAdmin.id);

    const adminRole = seededRoles.find((role) => role.name === 'ADMIN');
    const organizationAdminRole = seededRoles.find((role) => role.name === 'ORGANIZATION ADMIN');
    const memberRole = seededRoles.find((role) => role.name === 'MEMBER');

    if (!adminRole || !organizationAdminRole || !memberRole) {
      throw new Error('Seed roles were not created correctly');
    }

    await tx.delete(userRoles).where(eq(userRoles.userId, superAdmin.id));
    await tx.insert(userRoles).values({ userId: superAdmin.id, roleId: adminRole.id });

    await tx
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, superAdmin.id),
          eq(organizationMembers.organizationId, mainOrganization.id)
        )
      );
    await tx.insert(organizationMembers).values({
      userId: superAdmin.id,
      organizationId: mainOrganization.id,
      roleId: organizationAdminRole.id,
    });

    const roleIds = seededRoles.map((role) => role.id);
    const existingRolePermissions = await tx
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.target, 'ROLE'));

    for (const permission of existingRolePermissions) {
      await tx.delete(permissionActions).where(eq(permissionActions.permissionId, permission.id));
    }
    await tx.delete(permissions).where(eq(permissions.target, 'ROLE'));

    const existingUserPermissions = await tx
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.userId, superAdmin.id));
    for (const permission of existingUserPermissions) {
      await tx.delete(permissionActions).where(eq(permissionActions.permissionId, permission.id));
    }
    await tx.delete(permissions).where(eq(permissions.userId, superAdmin.id));

    const wildcardResource = seededResources.find((resource) => resource.slug === '*');
    if (!wildcardResource) {
      throw new Error('Wildcard resource missing');
    }

    const [superAdminPermission] = await tx
      .insert(permissions)
      .values({
        target: 'USER',
        userId: superAdmin.id,
        resourceId: wildcardResource.id,
      })
      .returning();

    await tx.insert(permissionActions).values(
      seededActions.map((action) => ({
        permissionId: superAdminPermission.id,
        actionId: action.id,
      }))
    );

    for (const resource of seededResources) {
      const [permission] = await tx
        .insert(permissions)
        .values({
          target: 'ROLE',
          roleId: organizationAdminRole.id,
          resourceId: resource.id,
        })
        .returning();

      await tx.insert(permissionActions).values(
        seededActions.map((action) => ({
          permissionId: permission.id,
          actionId: action.id,
        }))
      );
    }

    const viewAction = seededActions.find((action) => action.slug === 'view');
    const profileResource = seededResources.find((resource) => resource.slug === 'profile');
    const dashboardResource = seededResources.find((resource) => resource.slug === 'dashboard');

    if (viewAction) {
      for (const resource of [profileResource, dashboardResource].filter(Boolean)) {
        const [permission] = await tx
          .insert(permissions)
          .values({
            target: 'ROLE',
            roleId: memberRole.id,
            resourceId: resource!.id,
          })
          .returning();

        await tx.insert(permissionActions).values({
          permissionId: permission.id,
          actionId: viewAction.id,
        });
      }
    }

    if (!roleIds.length) {
      throw new Error('No roles were seeded');
    }
  });
}

async function main() {
  const { db, pool } = createNodeDb();

  try {
    await seedDatabase(db);
    console.log('Database seed completed');
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
}
