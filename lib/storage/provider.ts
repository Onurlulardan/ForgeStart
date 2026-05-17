import type { StorageProvider as StorageProviderId } from '@/db/types';

export interface StoragePutInput {
  buffer: Buffer;
  key: string;
  contentType: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
}

export interface StoragePutResult {
  key: string;
  url: string | null;
  size: number;
  provider: StorageProviderId;
}

export interface StorageGetUrlOptions {
  expiresInSeconds?: number;
  download?: boolean;
  fileName?: string;
}

export interface StorageProvider {
  readonly id: StorageProviderId;
  put(input: StoragePutInput): Promise<StoragePutResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string, options?: StorageGetUrlOptions): Promise<string>;
  exists(key: string): Promise<boolean>;
  read(key: string): Promise<Buffer>;
}
