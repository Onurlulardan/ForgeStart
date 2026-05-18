import { env } from '../../env';
import { LocalDiskStorage } from './local-disk';
import { S3Storage } from './s3';
import type { StorageProvider } from './provider';

let cached: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (cached) return cached;

  if (env.STORAGE_DRIVER === 's3') {
    cached = new S3Storage({
      bucket: env.STORAGE_S3_BUCKET!,
      region: env.STORAGE_S3_REGION,
      endpoint: env.STORAGE_S3_ENDPOINT,
      accessKeyId: env.STORAGE_S3_ACCESS_KEY!,
      secretAccessKey: env.STORAGE_S3_SECRET_KEY!,
      publicUrl: env.STORAGE_S3_PUBLIC_URL,
    });
    return cached;
  }

  cached = new LocalDiskStorage({
    rootPath: env.STORAGE_LOCAL_PATH,
    publicUrl: env.STORAGE_LOCAL_URL,
  });
  return cached;
}

export type { StorageProvider, StoragePutInput, StoragePutResult } from './provider';
export {
  ALLOWED_MIME_TYPES,
  DOCUMENT_MIME_TYPES,
  IMAGE_MIME_TYPES,
  isImage,
  validateUpload,
} from './validators';
