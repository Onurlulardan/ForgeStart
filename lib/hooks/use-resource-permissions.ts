'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { hasSessionPermission } from '@/lib/auth/permissions';

export interface ResourcePermissionFlags {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
}

export function useResourcePermissions(
  resource: string,
  organizationId?: string
): ResourcePermissionFlags {
  const { data: session } = useSession();
  const user = session?.user;

  return useMemo(
    () => ({
      canView: hasSessionPermission(user, resource, 'view', organizationId),
      canCreate: hasSessionPermission(user, resource, 'create', organizationId),
      canEdit: hasSessionPermission(user, resource, 'edit', organizationId),
      canDelete: hasSessionPermission(user, resource, 'delete', organizationId),
      canManage: hasSessionPermission(user, resource, 'manage', organizationId),
    }),
    [user, resource, organizationId]
  );
}
