import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { handleRouteError, jsonError } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { writeAuditLog } from '@/lib/audit';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('api-key', 'delete');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const [updated] = await db
      .update(apiKeys)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();

    if (!updated) return jsonError('API key not found', 404);

    await writeAuditLog({
      sessionUser: authz.session.user,
      request,
      action: 'api_key.revoke',
      resource: 'api-key',
      resourceId: id,
      message: `API key revoked: ${updated.name}`,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleRouteError('[API_KEYS_DELETE]', error);
  }
}
