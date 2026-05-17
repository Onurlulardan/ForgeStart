import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  StorageGetUrlOptions,
  StoragePutInput,
  StoragePutResult,
  StorageProvider,
} from './provider';

export interface S3StorageOptions {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string;
  forcePathStyle?: boolean;
}

function joinUrl(base: string, key: string): string {
  const cleanedBase = base.replace(/\/+$/, '');
  const cleanedKey = key.replace(/^\/+/, '');
  return `${cleanedBase}/${cleanedKey}`;
}

export class S3Storage implements StorageProvider {
  readonly id = 's3' as const;
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl?: string;

  constructor(options: S3StorageOptions) {
    this.bucket = options.bucket;
    this.publicUrl = options.publicUrl;
    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint || undefined,
      forcePathStyle: options.forcePathStyle ?? Boolean(options.endpoint),
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
  }

  async put(input: StoragePutInput): Promise<StoragePutResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.buffer,
        ContentType: input.contentType,
        CacheControl: input.cacheControl,
        Metadata: input.metadata,
      })
    );
    return {
      key: input.key,
      url: this.publicUrl ? joinUrl(this.publicUrl, input.key) : null,
      size: input.buffer.byteLength,
      provider: this.id,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async getUrl(key: string, options?: StorageGetUrlOptions): Promise<string> {
    if (this.publicUrl && !options?.download && !options?.expiresInSeconds) {
      return joinUrl(this.publicUrl, key);
    }
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: options?.download
        ? `attachment; filename="${options.fileName ?? key.split('/').pop()}"`
        : undefined,
    });
    return getSignedUrl(this.client, command, {
      expiresIn: options?.expiresInSeconds ?? 60 * 5,
    });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async read(key: string): Promise<Buffer> {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    const stream = result.Body as ReadableStream<Uint8Array> | null;
    if (!stream) throw new Error('Empty S3 response body');
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    return Buffer.concat(chunks.map((c) => Buffer.from(c)));
  }
}
