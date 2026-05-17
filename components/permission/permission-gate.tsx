'use client';

import type { ReactNode } from 'react';
import { usePermission } from '@/lib/auth/client-permissions';

export interface PermissionGateProps {
  resource: string;
  action: string;
  organizationId?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  resource,
  action,
  organizationId,
  fallback = null,
  children,
}: PermissionGateProps) {
  const allowed = usePermission(resource, action, organizationId);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
