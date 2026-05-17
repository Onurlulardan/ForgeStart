import type { OrganizationMembership, PermissionPayload, SessionUser } from './types';

function hasActionPermission(permission: PermissionPayload, actionSlug: string): boolean {
  return permission.actions.some(
    (action) => action.slug === actionSlug || action.slug === 'manage'
  );
}

function checkResourcePermission(
  permissions: PermissionPayload[] | undefined,
  resourceSlug: string,
  actionSlug: string
): boolean {
  return Boolean(
    permissions?.some(
      (permission) =>
        (permission.resource.slug === resourceSlug || permission.resource.slug === '*') &&
        hasActionPermission(permission, actionSlug)
    )
  );
}

export function hasSessionPermission(
  user: SessionUser | undefined,
  resourceSlug: string,
  actionSlug: string,
  organizationId?: string
): boolean {
  if (!user) return false;

  const hasAdminRole = user.userRoles?.some(({ role }) => role.name === 'ADMIN');
  if (hasAdminRole) return true;

  if (checkResourcePermission(user.permissions, resourceSlug, actionSlug)) {
    return true;
  }

  const memberships = user.memberships ?? [];

  if (organizationId) {
    const membership = memberships.find(
      (item: OrganizationMembership) => item.organization.id === organizationId
    );

    if (!membership) return false;

    return (
      checkResourcePermission(membership.role?.permissions, resourceSlug, actionSlug) ||
      checkResourcePermission(membership.organization.permissions, resourceSlug, actionSlug)
    );
  }

  return memberships.some(
    (membership) =>
      checkResourcePermission(membership.role?.permissions, resourceSlug, actionSlug) ||
      checkResourcePermission(membership.organization.permissions, resourceSlug, actionSlug)
  );
}
