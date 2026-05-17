import { NextResponse } from 'next/server';
import { listSecurityLogs } from '@/lib/api/admin-queries';
import { handleRouteError } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';

export async function GET() {
  try {
    const authz = await requireApiPermission('security-log', 'view');
    if (!authz.ok) return authz.response;

    return NextResponse.json(await listSecurityLogs());
  } catch (error) {
    return handleRouteError('[SECURITY_LOGS_GET]', error);
  }
}
