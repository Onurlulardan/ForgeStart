import { MemoryRateLimiter } from './memory';
import { UpstashRateLimiter } from './upstash';
import type { RateLimitOptions, RateLimitResult, RateLimiter } from './provider';

let cached: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    cached = new UpstashRateLimiter(url, token);
  } else {
    cached = new MemoryRateLimiter();
  }
  return cached;
}

export async function checkRateLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  return getRateLimiter().limit(key, options);
}

export type { RateLimitOptions, RateLimitResult, RateLimiter } from './provider';
export { RATE_LIMIT_PRESETS, type RateLimitPresetId } from './presets';
