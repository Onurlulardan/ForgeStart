import { NextResponse } from 'next/server';
import { listAvailableUsers } from '@/lib/api/admin-queries';
import { handleRouteError } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';

export async function GET() {
  try {
    const authz = await requireApiPermission('user', 'view');
    if (!authz.ok) return authz.response;

    return NextResponse.json(await listAvailableUsers());
  } catch (error) {
    return handleRouteError('[USERS_AVAILABLE_GET]', error);
  }
}
