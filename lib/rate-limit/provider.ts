export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

export interface RateLimiter {
  readonly id: string;
  limit(key: string, options: RateLimitOptions): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}
