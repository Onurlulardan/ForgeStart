import { NextResponse } from 'next/server';
import { getClientInfo } from '@/lib/auth/session-data';
import { checkRateLimit } from './index';
import { RATE_LIMIT_PRESETS, type RateLimitPresetId } from './presets';

export interface RateLimitGuardOptions {
  preset: RateLimitPresetId;
  identifier?: string;
  request?: Request;
  namespace?: string;
}

export interface RateLimitGuardSuccess {
  ok: true;
  remaining: number;
  resetAt: Date;
  limit: number;
}

export interface RateLimitGuardFailure {
  ok: false;
  response: NextResponse;
}

export async function requireRateLimit(
  options: RateLimitGuardOptions
): Promise<RateLimitGuardSuccess | RateLimitGuardFailure> {
  const presetOptions = RATE_LIMIT_PRESETS[options.preset];
  const identifier = options.identifier ?? getClientInfo(options.request).ipAddress;
  const namespace = options.namespace ?? options.preset;
  const key = `${namespace}:${identifier}`;

  const result = await checkRateLimit(key, presetOptions);
  if (!result.success) {
    const retryAfterSeconds = Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000));
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSeconds),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': result.resetAt.toISOString(),
          },
        }
      ),
    };
  }

  return {
    ok: true,
    remaining: result.remaining,
    resetAt: result.resetAt,
    limit: result.limit,
  };
}
