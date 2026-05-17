import { NextResponse } from 'next/server';
import { count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { organizations, users } from '@/db/schema';
import { handleRouteError } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';

export async function GET() {
  try {
    const authz = await requireApiPermission('dashboard', 'view');
    if (!authz.ok) return authz.response;

    const [[orgCount], [userCount], [activeUserCount]] = await Promise.all([
      db.select({ count: count() }).from(organizations),
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(users).where(eq(users.status, 'ACTIVE')),
    ]);

    return NextResponse.json({
      totalOrganizations: orgCount.count,
      totalUsers: userCount.count,
      activeUsers: activeUserCount.count,
    });
  } catch (error) {
    return handleRouteError('[DASHBOARD_STATS_GET]', error);
  }
}
