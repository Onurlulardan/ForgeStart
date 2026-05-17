'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { usePermission } from '@/lib/auth/client-permissions';

export interface PermissionLinkProps extends Omit<ComponentProps<typeof Link>, 'children'> {
  resource: string;
  action: string;
  organizationId?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionLink({
  resource,
  action,
  organizationId,
  fallback = null,
  children,
  ...props
}: PermissionLinkProps) {
  const allowed = usePermission(resource, action, organizationId);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <Link {...props}>{children}</Link>;
}
