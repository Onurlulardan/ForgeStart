import { LocalDiskStorage } from './local-disk';
import { S3Storage } from './s3';
import type { StorageProvider } from './provider';

let cached: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (cached) return cached;
  const driver = (process.env.STORAGE_DRIVER ?? 'local').toLowerCase();

  if (driver === 's3') {
    const bucket = requireEnv('STORAGE_S3_BUCKET');
    cached = new S3Storage({
      bucket,
      region: process.env.STORAGE_S3_REGION ?? 'us-east-1',
      endpoint: process.env.STORAGE_S3_ENDPOINT || undefined,
      accessKeyId: requireEnv('STORAGE_S3_ACCESS_KEY'),
      secretAccessKey: requireEnv('STORAGE_S3_SECRET_KEY'),
      publicUrl: process.env.STORAGE_S3_PUBLIC_URL || undefined,
    });
    return cached;
  }

  cached = new LocalDiskStorage({
    rootPath: process.env.STORAGE_LOCAL_PATH ?? './public/uploads',
    publicUrl: process.env.STORAGE_LOCAL_URL ?? '/uploads',
  });
  return cached;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

export type { StorageProvider, StoragePutInput, StoragePutResult } from './provider';
export {
  ALLOWED_MIME_TYPES,
  DOCUMENT_MIME_TYPES,
  IMAGE_MIME_TYPES,
  isImage,
  validateUpload,
} from './validators';
