import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { getClientInfo } from '@/lib/auth/session-data';
import type { SessionUser } from '@/lib/auth/types';

type AuditInput = {
  sessionUser?: SessionUser | null;
  request?: Request;
  action: string;
  resource: string;
  resourceId?: string | null;
  status?: 'SUCCESS' | 'FAILED';
  message: string;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditInput) {
  const { ipAddress, userAgent } = getClientInfo(input.request);

  await db
    .insert(auditLogs)
    .values({
      actorId: input.sessionUser?.id ?? null,
      actorEmail: input.sessionUser?.email ?? null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId ?? null,
      status: input.status ?? 'SUCCESS',
      message: input.message,
      metadata: input.metadata ?? {},
      ipAddress,
      userAgent,
    })
    .catch(console.error);
}
