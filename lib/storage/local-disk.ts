import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  StorageGetUrlOptions,
  StoragePutInput,
  StoragePutResult,
  StorageProvider,
} from './provider';

export interface LocalDiskOptions {
  rootPath: string;
  publicUrl: string;
}

function joinUrl(base: string, key: string): string {
  const cleanedBase = base.replace(/\/+$/, '');
  const cleanedKey = key.replace(/^\/+/, '');
  return `${cleanedBase}/${cleanedKey}`;
}

export class LocalDiskStorage implements StorageProvider {
  readonly id = 'local' as const;
  private readonly rootPath: string;
  private readonly publicUrl: string;

  constructor(options: LocalDiskOptions) {
    this.rootPath = path.resolve(
      /* turbopackIgnore: true */ process.cwd(),
      options.rootPath
    );
    this.publicUrl = options.publicUrl;
  }

  private resolveKey(key: string): string {
    const safeKey = key.replace(/^\/+/, '').replaceAll('..', '');
    const target = path.resolve(this.rootPath, safeKey);
    const relative = path.relative(this.rootPath, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Refusing to access path outside of storage root');
    }
    return target;
  }

  async put(input: StoragePutInput): Promise<StoragePutResult> {
    const absolute = this.resolveKey(input.key);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, input.buffer);
    return {
      key: input.key,
      url: joinUrl(this.publicUrl, input.key),
      size: input.buffer.byteLength,
      provider: this.id,
    };
  }

  async delete(key: string): Promise<void> {
    const absolute = this.resolveKey(key);
    await fs.rm(absolute, { force: true });
    await this.cleanupEmptyDir(path.dirname(absolute));
  }

  async getUrl(key: string, _options?: StorageGetUrlOptions): Promise<string> {
    void _options;
    return joinUrl(this.publicUrl, key);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.resolveKey(key));
      return true;
    } catch {
      return false;
    }
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.resolveKey(key));
  }

  private async cleanupEmptyDir(dir: string): Promise<void> {
    const relative = path.relative(this.rootPath, dir);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return;
    try {
      const entries = await fs.readdir(dir);
      if (entries.length === 0) {
        await fs.rmdir(dir);
        await this.cleanupEmptyDir(path.dirname(dir));
      }
    } catch {
      // ignore
    }
  }
}
