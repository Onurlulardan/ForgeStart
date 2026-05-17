import 'server-only';
import { checkRateLimit } from '@/lib/rate-limit';
import { RATE_LIMIT_PRESETS, type RateLimitPresetId } from '@/lib/rate-limit/presets';
import { failure, type ActionResult } from './result';

interface WithRateLimitOptions {
  preset: RateLimitPresetId;
  identifier: () => string | Promise<string>;
  namespace?: string;
}

export function withRateLimit<TArgs extends unknown[], TResult>(
  handler: (...args: TArgs) => Promise<ActionResult<TResult>>,
  options: WithRateLimitOptions
) {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    const preset = RATE_LIMIT_PRESETS[options.preset];
    const identifier = await options.identifier();
    const key = `${options.namespace ?? options.preset}:${identifier}`;
    const result = await checkRateLimit(key, preset);
    if (!result.success) {
      const retryAfter = Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000));
      return failure(`Too many requests. Try again in ${retryAfter}s.`, 'RATE_LIMITED');
    }
    return handler(...args);
  };
}
