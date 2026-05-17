import { and, eq, inArray } from 'drizzle-orm';
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
import type { PermissionPayload, SessionUser } from './types';

type PermissionRow = {
  permissionId: string;
  target: 'USER' | 'ROLE' | 'ORGANIZATION';
  userId: string | null;
  roleId: string | null;
  organizationId: string | null;
  resourceSlug: string;
  actionSlug: string;
};

function groupPermissionRows(rows: PermissionRow[]): PermissionPayload[] {
  const grouped = new Map<string, PermissionPayload>();

  for (const row of rows) {
    const existing = grouped.get(row.permissionId);
    if (existing) {
      existing.actions.push({ slug: row.actionSlug });
      continue;
    }

    grouped.set(row.permissionId, {
      target: row.target,
      resource: { slug: row.resourceSlug },
      actions: [{ slug: row.actionSlug }],
    });
  }

  return [...grouped.values()];
}

function groupPermissionsByOwner(
  rows: PermissionRow[],
  ownerKey: 'roleId' | 'organizationId'
): Map<string, PermissionPayload[]> {
  const result = new Map<string, PermissionPayload[]>();
  const ownerIds = new Set(rows.map((row) => row[ownerKey]).filter(Boolean) as string[]);

  for (const ownerId of ownerIds) {
    result.set(ownerId, groupPermissionRows(rows.filter((row) => row[ownerKey] === ownerId)));
  }

  return result;
}

async function getUserPermissionRows(userId: string): Promise<PermissionRow[]> {
  return db
    .select({
      permissionId: permissions.id,
      target: permissions.target,
      userId: permissions.userId,
      roleId: permissions.roleId,
      organizationId: permissions.organizationId,
      resourceSlug: resources.slug,
      actionSlug: actions.slug,
    })
    .from(permissions)
    .innerJoin(resources, eq(permissions.resourceId, resources.id))
    .innerJoin(permissionActions, eq(permissionActions.permissionId, permissions.id))
    .innerJoin(actions, eq(permissionActions.actionId, actions.id))
    .where(and(eq(permissions.target, 'USER'), eq(permissions.userId, userId)));
}

async function getRolePermissionRows(roleIds: string[]): Promise<PermissionRow[]> {
  if (!roleIds.length) return [];

  return db
    .select({
      permissionId: permissions.id,
      target: permissions.target,
      userId: permissions.userId,
      roleId: permissions.roleId,
      organizationId: permissions.organizationId,
      resourceSlug: resources.slug,
      actionSlug: actions.slug,
    })
    .from(permissions)
    .innerJoin(resources, eq(permissions.resourceId, resources.id))
    .innerJoin(permissionActions, eq(permissionActions.permissionId, permissions.id))
    .innerJoin(actions, eq(permissionActions.actionId, actions.id))
    .where(and(eq(permissions.target, 'ROLE'), inArray(permissions.roleId, roleIds)));
}

async function getOrganizationPermissionRows(organizationIds: string[]): Promise<PermissionRow[]> {
  if (!organizationIds.length) return [];

  return db
    .select({
      permissionId: permissions.id,
      target: permissions.target,
      userId: permissions.userId,
      roleId: permissions.roleId,
      organizationId: permissions.organizationId,
      resourceSlug: resources.slug,
      actionSlug: actions.slug,
    })
    .from(permissions)
    .innerJoin(resources, eq(permissions.resourceId, resources.id))
    .innerJoin(permissionActions, eq(permissionActions.permissionId, permissions.id))
    .innerJoin(actions, eq(permissionActions.actionId, actions.id))
    .where(
      and(
        eq(permissions.target, 'ORGANIZATION'),
        inArray(permissions.organizationId, organizationIds)
      )
    );
}

export async function getSessionUserPayload(userId: string): Promise<SessionUser | null> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  const [userRoleRows, membershipRows, directPermissionRows] = await Promise.all([
    db
      .select({
        roleId: roles.id,
        roleName: roles.name,
        roleDescription: roles.description,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id)),
    db
      .select({
        membershipId: organizationMembers.id,
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
      .where(eq(organizationMembers.userId, user.id)),
    getUserPermissionRows(user.id),
  ]);

  const membershipRoleIds = membershipRows
    .map((membership) => membership.roleId)
    .filter(Boolean) as string[];
  const organizationIds = membershipRows.map((membership) => membership.organizationId);

  const [rolePermissionRows, organizationPermissionRows] = await Promise.all([
    getRolePermissionRows(membershipRoleIds),
    getOrganizationPermissionRows(organizationIds),
  ]);

  const rolePermissions = groupPermissionsByOwner(rolePermissionRows, 'roleId');
  const organizationPermissions = groupPermissionsByOwner(
    organizationPermissionRows,
    'organizationId'
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    avatar: user.avatar,
    avatarUploadId: user.avatarUploadId,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    emailVerified: user.emailVerified,
    status: user.status,
    permissions: groupPermissionRows(directPermissionRows),
    userRoles: userRoleRows.map((row) => ({
      role: {
        id: row.roleId,
        name: row.roleName,
        description: row.roleDescription ?? '',
      },
    })),
    memberships: membershipRows.map((membership) => ({
      id: membership.membershipId,
      role: membership.roleId
        ? {
            id: membership.roleId,
            name: membership.roleName ?? '',
            description: membership.roleDescription ?? '',
            permissions: rolePermissions.get(membership.roleId) ?? [],
          }
        : null,
      organization: {
        id: membership.organizationId,
        name: membership.organizationName,
        slug: membership.organizationSlug,
        permissions: organizationPermissions.get(membership.organizationId) ?? [],
      },
    })),
  };
}

export function getClientInfo(request?: Request) {
  const headers = request?.headers;
  const forwardedFor = headers?.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ipAddress =
    forwardedFor || headers?.get('x-real-ip') || headers?.get('cf-connecting-ip') || '0.0.0.0';

  return {
    ipAddress: ipAddress === '::1' ? '127.0.0.1' : ipAddress,
    userAgent: headers?.get('user-agent') || 'Unknown',
  };
}

export async function logSecurityEvent(input: {
  userId?: string | null;
  email: string;
  status: 'SUCCESS' | 'FAILED';
  type: 'LOGIN' | 'REGISTER';
  message: string;
  request?: Request;
}) {
  const { ipAddress, userAgent } = getClientInfo(input.request);

  await db
    .insert(securityLogs)
    .values({
      userId: input.userId ?? null,
      email: input.email,
      ipAddress,
      userAgent,
      status: input.status,
      type: input.type,
      message: input.message,
    })
    .catch(console.error);
}
