import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { hashToken } from '@/lib/tokens';

export async function verifyApiKey(rawKey: string) {
  const now = new Date();
  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hashToken(rawKey)), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!apiKey) return null;

  if (apiKey.expiresAt && apiKey.expiresAt <= now) {
    return null;
  }

  await db.update(apiKeys).set({ lastUsedAt: now }).where(eq(apiKeys.id, apiKey.id));
  return apiKey;
}
