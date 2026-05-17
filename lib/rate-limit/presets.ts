import type { RateLimitOptions } from './provider';

export const RATE_LIMIT_PRESETS = {
  authLogin: { limit: 5, windowMs: 10 * 60 * 1000 },
  authRegister: { limit: 3, windowMs: 10 * 60 * 1000 },
  authPasswordReset: { limit: 3, windowMs: 10 * 60 * 1000 },
  verifyEmailResend: { limit: 1, windowMs: 60 * 1000 },
  apiKeyCreate: { limit: 10, windowMs: 60 * 60 * 1000 },
  defaultApi: { limit: 100, windowMs: 60 * 1000 },
} satisfies Record<string, RateLimitOptions>;

export type RateLimitPresetId = keyof typeof RATE_LIMIT_PRESETS;
