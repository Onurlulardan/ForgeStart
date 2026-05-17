import { LRUCache } from 'lru-cache';
import type { RateLimitOptions, RateLimitResult, RateLimiter } from './provider';

interface Bucket {
  count: number;
  resetAt: number;
}

export class MemoryRateLimiter implements RateLimiter {
  readonly id = 'memory';
  private cache: LRUCache<string, Bucket>;

  constructor(maxKeys = 10_000) {
    this.cache = new LRUCache<string, Bucket>({ max: maxKeys });
  }

  async limit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.cache.get(key);
    if (!existing || existing.resetAt <= now) {
      const bucket: Bucket = { count: 1, resetAt: now + options.windowMs };
      this.cache.set(key, bucket, { ttl: options.windowMs });
      return {
        success: true,
        remaining: Math.max(0, options.limit - 1),
        resetAt: new Date(bucket.resetAt),
        limit: options.limit,
      };
    }

    existing.count += 1;
    const success = existing.count <= options.limit;
    return {
      success,
      remaining: Math.max(0, options.limit - existing.count),
      resetAt: new Date(existing.resetAt),
      limit: options.limit,
    };
  }

  async reset(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
