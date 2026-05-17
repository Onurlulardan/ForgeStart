import sharp from 'sharp';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
}

export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata | null> {
  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) return null;
    return {
      width: meta.width,
      height: meta.height,
      format: meta.format ?? 'unknown',
    };
  } catch {
    return null;
  }
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  quality?: number;
}

export async function resizeImage(buffer: Buffer, options: ResizeOptions): Promise<Buffer> {
  let pipeline = sharp(buffer);
  if (options.width || options.height) {
    pipeline = pipeline.resize({
      width: options.width,
      height: options.height,
      fit: options.fit ?? 'cover',
      withoutEnlargement: true,
    });
  }
  const format = options.format ?? 'webp';
  pipeline = pipeline.toFormat(format, { quality: options.quality ?? 85 });
  return pipeline.toBuffer();
}

export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return resizeImage(buffer, { width: 320, height: 320, fit: 'cover', format: 'webp' });
}
