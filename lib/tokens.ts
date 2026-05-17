import { createHash, randomBytes } from 'node:crypto';

export function generateToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function generateApiKey() {
  const secret = generateToken(36);
  return `nsk_${secret}`;
}

export function getApiKeyPrefix(key: string) {
  return key.slice(0, 12);
}
