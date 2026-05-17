import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { auditLogs, users } from '@/db/schema';
import { handleRouteError } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';

export async function GET() {
  try {
    const authz = await requireApiPermission('audit-log', 'view');
    if (!authz.ok) return authz.response;

    const rows = await db
      .select({
        id: auditLogs.id,
        actorId: auditLogs.actorId,
        actorEmail: auditLogs.actorEmail,
        action: auditLogs.action,
        resource: auditLogs.resource,
        resourceId: auditLogs.resourceId,
        status: auditLogs.status,
        message: auditLogs.message,
        metadata: auditLogs.metadata,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        actor: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(250);

    return NextResponse.json(rows);
  } catch (error) {
    return handleRouteError('[AUDIT_LOGS_GET]', error);
  }
}
