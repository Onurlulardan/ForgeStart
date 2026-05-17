import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { uploads } from '@/db/schema';
import { auth } from '@/auth';
import { handleRouteError, jsonError } from '@/lib/api/response';
import { deleteUpload, getUploadUrl } from '@/lib/storage/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) return jsonError('Unauthorized', 401);

    const { id } = await context.params;
    const [record] = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
    if (!record) return jsonError('Not found', 404);

    const url = await getUploadUrl(id);
    return NextResponse.json({ ...record, url });
  } catch (error) {
    return handleRouteError('[UPLOAD_GET]', error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) return jsonError('Unauthorized', 401);

    const { id } = await context.params;
    const ok = await deleteUpload(id, session.user.id);
    if (!ok) return jsonError('Not found', 404);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError('[UPLOAD_DELETE]', error);
  }
}
