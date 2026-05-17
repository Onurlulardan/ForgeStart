import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { RateLimitOptions, RateLimitResult, RateLimiter } from './provider';

export class UpstashRateLimiter implements RateLimiter {
  readonly id = 'upstash';
  private redis: Redis;
  private cache = new Map<string, Ratelimit>();

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token });
  }

  private getLimiter(options: RateLimitOptions): Ratelimit {
    const key = `${options.limit}:${options.windowMs}`;
    let limiter = this.cache.get(key);
    if (!limiter) {
      limiter = new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(options.limit, `${options.windowMs} ms`),
        analytics: false,
        prefix: 'rl',
      });
      this.cache.set(key, limiter);
    }
    return limiter;
  }

  async limit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
    const limiter = this.getLimiter(options);
    const result = await limiter.limit(key);
    return {
      success: result.success,
      remaining: result.remaining,
      resetAt: new Date(result.reset),
      limit: result.limit,
    };
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(`rl:${key}`);
  }
}
