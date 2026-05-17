'use client';

import { useSession } from 'next-auth/react';
import React from 'react';
import { hasSessionPermission } from './permissions';

/**
 * React hook that checks if the user has permission for a specific resource and action on the client side
 * @param resourceSlug - The resource slug to check (e.g., 'user', 'role', 'organization')
 * @param actionSlug - The action slug to check (e.g., 'create', 'view', 'edit', 'delete')
 * @param organizationId - Optional, used to check permissions for a specific organization
 * @returns True if the user has permission for the specified resource and action, false otherwise
 * @example
 * // Usage in a component:
 * function UserManagementPage() {
 *   const canCreateUser = usePermission('user', 'create');
 *   const canEditUser = usePermission('user', 'edit');
 *
 *   return (
 *     <div>
 *       {canCreateUser && <Button>Add New User</Button>}
 *       <UserList canEdit={canEditUser} />
 *     </div>
 *   );
 * }
 */
export function usePermission(
  resourceSlug: string,
  actionSlug: string,
  organizationId?: string
): boolean {
  const { data: session } = useSession();
  return hasSessionPermission(session?.user, resourceSlug, actionSlug, organizationId);
}

/**
 * A Higher-Order Component (HOC) that performs permission checks
 * Renders the component if permission exists for the specified resource and action, otherwise returns null
 * @param Component - The React component to wrap
 * @param resourceSlug - The resource slug to check (e.g., 'user', 'role', 'organization')
 * @param actionSlug - The action slug to check (e.g., 'create', 'view', 'edit', 'delete')
 * @param organizationId - Optional, used to check permissions for a specific organization
 * @returns A new component that wraps the original component with permission checking
 * @example
 * // Usage example:
 * const UserCreateButton = withPermission(CreateButton, 'user', 'create');
 *
 * // With permission check for a specific organization:
 * const OrgSettingsPanel = withPermission(SettingsPanel, 'organization', 'edit', organization.id);
 *
 * // Then you can use these components normally:
 * return (
 *   <div>
 *     <UserCreateButton onClick={handleCreate} />
 *     <OrgSettingsPanel settings={settings} />
 *   </div>
 * );
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  resourceSlug: string,
  actionSlug: string,
  organizationId?: string
): React.FC<P> {
  const PermissionWrapper: React.FC<P> = (props) => {
    const hasPermission = usePermission(resourceSlug, actionSlug, organizationId);

    if (!hasPermission) {
      return null;
    }

    return React.createElement(Component, props);
  };

  // Copy display name for better debugging
  PermissionWrapper.displayName = `WithPermission(${
    Component.displayName || Component.name || 'Component'
  })`;

  return PermissionWrapper;
}
