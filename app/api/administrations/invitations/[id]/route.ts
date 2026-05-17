import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { invitations } from '@/db/schema';
import { handleRouteError, jsonError } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { writeAuditLog } from '@/lib/audit';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('invitation', 'delete');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const [updated] = await db
      .update(invitations)
      .set({ status: 'REVOKED', revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(invitations.id, id))
      .returning();

    if (!updated) return jsonError('Invitation not found', 404);

    await writeAuditLog({
      sessionUser: authz.session.user,
      request,
      action: 'invitation.revoke',
      resource: 'invitation',
      resourceId: id,
      message: `Invitation revoked for ${updated.email}`,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleRouteError('[INVITATIONS_DELETE]', error);
  }
}
