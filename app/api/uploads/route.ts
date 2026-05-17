import { NextResponse } from 'next/server';
import { desc, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { uploads } from '@/db/schema';
import { UploadKind } from '@/db/types';
import { auth } from '@/auth';
import { handleRouteError, jsonError } from '@/lib/api/response';
import { createUpload } from '@/lib/storage/service';

const ALLOWED_KINDS = new Set<string>(Object.values(UploadKind));

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return jsonError('Unauthorized', 401);

    const rows = await db
      .select()
      .from(uploads)
      .where(isNull(uploads.deletedAt))
      .orderBy(desc(uploads.createdAt))
      .limit(100);

    return NextResponse.json(rows.filter((row) => row.ownerId === session.user.id));
  } catch (error) {
    return handleRouteError('[UPLOADS_GET]', error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return jsonError('Unauthorized', 401);

    const formData = await request.formData();
    const file = formData.get('file');
    const kindValue = (formData.get('kind') as string | null) ?? UploadKind.ATTACHMENT;

    if (!(file instanceof File)) {
      return jsonError('A file is required', 400);
    }
    if (!ALLOWED_KINDS.has(kindValue)) {
      return jsonError('Invalid upload kind', 400);
    }

    const replaceUploadId = formData.get('replaceUploadId') as string | null;

    const created = await createUpload({
      file,
      filename: file.name,
      kind: kindValue as (typeof UploadKind)[keyof typeof UploadKind],
      ownerId: session.user.id,
      validation:
        kindValue === UploadKind.AVATAR || kindValue === UploadKind.ORGANIZATION_LOGO
          ? { imageOnly: true, maxSize: 5 * 1024 * 1024 }
          : undefined,
      pathPrefix: `users/${session.user.id}/${kindValue}`,
    });

    if (replaceUploadId) {
      const { deleteUpload } = await import('@/lib/storage/service');
      await deleteUpload(replaceUploadId, session.user.id).catch(() => undefined);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleRouteError('[UPLOADS_POST]', error);
  }
}
