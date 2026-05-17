export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
] as const;

export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const;

export const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES];

export interface ValidationOptions {
  allowedMimes?: readonly string[];
  maxSize?: number;
  imageOnly?: boolean;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateUpload(
  file: { mime: string; size: number; name: string },
  options: ValidationOptions = {}
): ValidationResult {
  const maxSize =
    options.maxSize ?? Number(process.env.STORAGE_MAX_FILE_SIZE ?? 10 * 1024 * 1024);
  const allowed = options.imageOnly
    ? IMAGE_MIME_TYPES
    : (options.allowedMimes ?? ALLOWED_MIME_TYPES);

  if (file.size > maxSize) {
    return { ok: false, error: `File exceeds maximum size of ${maxSize} bytes` };
  }
  if (!allowed.includes(file.mime as never)) {
    return { ok: false, error: `Unsupported MIME type: ${file.mime}` };
  }
  return { ok: true };
}

export function isImage(mime: string): boolean {
  return IMAGE_MIME_TYPES.includes(mime as (typeof IMAGE_MIME_TYPES)[number]);
}
