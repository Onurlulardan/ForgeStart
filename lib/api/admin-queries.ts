import { asc, count, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  actions,
  organizationMembers,
  organizations,
  permissionActions,
  permissions,
  resources,
  roles,
  securityLogs,
  userRoles,
  users,
} from '@/db/schema';
import type { Organization, Permission, Role, User } from '@/db/types';

export type UserRoleRelation = {
  role: Pick<Role, 'id' | 'name' | 'description'>;
};

export type OrganizationMembershipRelation = {
  id: string;
  organization: Pick<Organization, 'id' | 'name' | 'slug'>;
  role: Pick<Role, 'id' | 'name' | 'description'> | null;
};

export type SafeUser = Omit<User, 'passwordHash'> & {
  userRoles?: UserRoleRelation[];
  memberships?: OrganizationMembershipRelation[];
};

function stripPasswordHash(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash: _password, ...safeUser } = user;
  void _password;
  return safeUser;
}

export async function getUserRelations(userId: string) {
  const [roleRows, membershipRows] = await Promise.all([
    db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId)),
    db
      .select({
        id: organizationMembers.id,
        organizationId: organizations.id,
        organizationName: organizations.name,
        organizationSlug: organizations.slug,
        roleId: roles.id,
        roleName: roles.name,
        roleDescription: roles.description,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .leftJoin(roles, eq(organizationMembers.roleId, roles.id))
      .where(eq(organizationMembers.userId, userId)),
  ]);

  return {
    userRoles: roleRows.map((role) => ({
      role: {
        id: role.id,
        name: role.name,
        description: role.description ?? '',
      },
    })),
    memberships: membershipRows.map((membership) => ({
      id: membership.id,
      organization: {
        id: membership.organizationId,
        name: membership.organizationName,
        slug: membership.organizationSlug,
      },
      role: membership.roleId
        ? {
            id: membership.roleId,
            name: membership.roleName ?? '',
            description: membership.roleDescription ?? '',
          }
        : null,
    })),
  };
}

export async function listUsers(): Promise<SafeUser[]> {
  const rows = await db.select().from(users).orderBy(asc(users.email));

  return Promise.all(
    rows.map(async (user) => ({
      ...stripPasswordHash(user),
      ...(await getUserRelations(user.id)),
    }))
  );
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) return null;

  return {
    ...stripPasswordHash(user),
    ...(await getUserRelations(user.id)),
  };
}

export async function listAvailableUsers() {
  return db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(eq(users.status, 'ACTIVE'))
    .orderBy(asc(users.firstName), asc(users.email));
}

export async function listResources() {
  const rows = await db.select().from(resources).orderBy(asc(resources.name));

  return Promise.all(
    rows.map(async (resource) => {
      const [permissionCount] = await db
        .select({ count: count() })
        .from(permissions)
        .where(eq(permissions.resourceId, resource.id));

      return {
        ...resource,
        _count: {
          permissions: permissionCount.count,
        },
      };
    })
  );
}

export async function listActions() {
  const rows = await db.select().from(actions).orderBy(asc(actions.name));

  return Promise.all(
    rows.map(async (action) => {
      const [permissionCount] = await db
        .select({ count: count() })
        .from(permissionActions)
        .where(eq(permissionActions.actionId, action.id));

      return {
        ...action,
        _count: {
          permissions: permissionCount.count,
        },
      };
    })
  );
}

export async function getPermissionActions(permissionId: string) {
  return db
    .select({
      id: permissionActions.id,
      action: {
        id: actions.id,
        name: actions.name,
        slug: actions.slug,
        description: actions.description,
        createdAt: actions.createdAt,
        updatedAt: actions.updatedAt,
      },
    })
    .from(permissionActions)
    .innerJoin(actions, eq(permissionActions.actionId, actions.id))
    .where(eq(permissionActions.permissionId, permissionId));
}

export async function expandPermission(permission: Permission) {
  const [resource, permissionActionRows] = await Promise.all([
    db.select().from(resources).where(eq(resources.id, permission.resourceId)).limit(1),
    getPermissionActions(permission.id),
  ]);

  const [user] =
    permission.target === 'USER' && permission.userId
      ? await db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(users)
          .where(eq(users.id, permission.userId))
          .limit(1)
      : [null];

  const [role] =
    permission.target === 'ROLE' && permission.roleId
      ? await db
          .select({
            id: roles.id,
            name: roles.name,
            organizationId: roles.organizationId,
          })
          .from(roles)
          .where(eq(roles.id, permission.roleId))
          .limit(1)
      : [null];

  const [organization] =
    permission.target === 'ORGANIZATION' && permission.organizationId
      ? await db
          .select({ id: organizations.id, name: organizations.name })
          .from(organizations)
          .where(eq(organizations.id, permission.organizationId))
          .limit(1)
      : [null];

  return {
    ...permission,
    resource: resource[0] ?? null,
    actions: permissionActionRows,
    user,
    role,
    organization,
  };
}

export async function listPermissions() {
  const rows = await db.select().from(permissions).orderBy(desc(permissions.createdAt));
  return Promise.all(rows.map(expandPermission));
}

export async function getPermissionById(id: string) {
  const [permission] = await db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
  if (!permission) return null;
  return expandPermission(permission);
}

export async function getRolePermissions(roleId: string) {
  const rows = await db
    .select()
    .from(permissions)
    .where(eq(permissions.roleId, roleId))
    .orderBy(asc(permissions.createdAt));

  return Promise.all(rows.map(expandPermission));
}

export async function expandRole(role: Role) {
  const [organization] = role.organizationId
    ? await db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
        })
        .from(organizations)
        .where(eq(organizations.id, role.organizationId))
        .limit(1)
    : [null];

  const [userRoleCount] = await db
    .select({ count: count() })
    .from(userRoles)
    .where(eq(userRoles.roleId, role.id));

  return {
    ...role,
    organization,
    permissions: await getRolePermissions(role.id),
    _count: {
      userRoles: userRoleCount.count,
    },
  };
}

export async function listRoles() {
  const rows = await db.select().from(roles).orderBy(asc(roles.name));
  return Promise.all(rows.map(expandRole));
}

export async function getRoleById(id: string) {
  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!role) return null;
  return expandRole(role);
}

export async function expandOrganization(organization: Organization) {
  const [[owner], children, [memberCount]] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, organization.ownerId))
      .limit(1),
    db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      })
      .from(organizations)
      .where(eq(organizations.parentId, organization.id)),
    db
      .select({ count: count() })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organization.id)),
  ]);

  return {
    ...organization,
    owner: owner ?? null,
    children,
    _count: {
      members: memberCount.count,
    },
  };
}

export async function listOrganizations() {
  const rows = await db.select().from(organizations).orderBy(asc(organizations.name));
  return Promise.all(rows.map(expandOrganization));
}

export async function getOrganizationById(id: string) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  if (!organization) return null;
  return expandOrganization(organization);
}

export async function listSecurityLogs() {
  const rows = await db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt));

  return Promise.all(
    rows.map(async (log) => {
      const [user] = log.userId
        ? await db
            .select({
              firstName: users.firstName,
              lastName: users.lastName,
            })
            .from(users)
            .where(eq(users.id, log.userId))
            .limit(1)
        : [null];

      return {
        ...log,
        user: user ?? null,
      };
    })
  );
}
