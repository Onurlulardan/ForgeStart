import 'server-only';
import crypto from 'node:crypto';
import path from 'node:path';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { uploads } from '@/db/schema';
import type { Upload, UploadKind } from '@/db/types';
import { UploadKind as UploadKindEnum } from '@/db/types';
import { getStorage } from './index';
import { generateThumbnail, getImageMetadata } from './image';
import { isImage, validateUpload, type ValidationOptions } from './validators';

export interface CreateUploadInput {
  file: File | Blob;
  filename: string;
  kind: UploadKind;
  ownerId?: string | null;
  validation?: ValidationOptions;
  pathPrefix?: string;
  metadata?: Record<string, unknown>;
}

function generateStorageKey(kind: UploadKind, originalName: string, pathPrefix?: string): string {
  const ext = path.extname(originalName).toLowerCase() || '';
  const safeName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const datePart = new Date().toISOString().slice(0, 7); // YYYY-MM
  const prefix = pathPrefix ?? kind;
  return `${prefix}/${datePart}/${safeName}`;
}

export async function createUpload(input: CreateUploadInput): Promise<Upload> {
  const file = input.file;
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = (file as File).type || 'application/octet-stream';
  const size = buffer.byteLength;

  const validation = validateUpload(
    { mime, size, name: input.filename },
    input.validation
  );
  if (!validation.ok) {
    throw new Error(validation.error ?? 'Upload validation failed');
  }

  const storage = getStorage();
  const key = generateStorageKey(input.kind, input.filename, input.pathPrefix);

  const stored = await storage.put({
    buffer,
    key,
    contentType: mime,
  });

  let width: number | null = null;
  let height: number | null = null;
  let thumbnailPath: string | null = null;
  if (isImage(mime)) {
    const meta = await getImageMetadata(buffer);
    if (meta) {
      width = meta.width;
      height = meta.height;
    }
    if (
      input.kind === UploadKindEnum.AVATAR ||
      input.kind === UploadKindEnum.ORGANIZATION_LOGO ||
      input.kind === UploadKindEnum.RICH_TEXT_IMAGE
    ) {
      try {
        const thumb = await generateThumbnail(buffer);
        const thumbKey = key.replace(/(\.[^./]+)?$/, '_thumb.webp');
        const thumbResult = await storage.put({
          buffer: thumb,
          key: thumbKey,
          contentType: 'image/webp',
        });
        thumbnailPath = thumbResult.key;
      } catch (err) {
        console.error('[storage.thumbnail]', err);
      }
    }
  }

  const [created] = await db
    .insert(uploads)
    .values({
      ownerId: input.ownerId ?? null,
      kind: input.kind,
      provider: stored.provider,
      filename: path.basename(key),
      originalName: input.filename,
      mime,
      size,
      path: stored.key,
      publicUrl: stored.url ?? null,
      width,
      height,
      thumbnailPath,
      metadata: input.metadata ?? {},
    })
    .returning();

  return created;
}

export async function deleteUpload(uploadId: string, ownerId?: string): Promise<boolean> {
  const conditions = [eq(uploads.id, uploadId), isNull(uploads.deletedAt)];
  if (ownerId) conditions.push(eq(uploads.ownerId, ownerId));

  const [record] = await db
    .select()
    .from(uploads)
    .where(and(...conditions))
    .limit(1);

  if (!record) return false;

  const storage = getStorage();
  try {
    await storage.delete(record.path);
    if (record.thumbnailPath) {
      await storage.delete(record.thumbnailPath);
    }
  } catch (error) {
    console.error('[storage.delete]', error);
  }

  await db.delete(uploads).where(eq(uploads.id, uploadId));
  return true;
}

export async function getUploadUrl(uploadId: string): Promise<string | null> {
  const [record] = await db.select().from(uploads).where(eq(uploads.id, uploadId)).limit(1);
  if (!record) return null;
  if (record.publicUrl) return record.publicUrl;
  const storage = getStorage();
  return storage.getUrl(record.path);
}
