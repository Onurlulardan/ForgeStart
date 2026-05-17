import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { apiKeys, users } from '@/db/schema';
import { handleRouteError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { apiKeyCreateSchema } from '@/lib/validation/admin';
import { generateApiKey, getApiKeyPrefix, hashToken } from '@/lib/tokens';
import { writeAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const authz = await requireApiPermission('api-key', 'view');
    if (!authz.ok) return authz.response;

    const rows = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        createdById: apiKeys.createdById,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        revokedAt: apiKeys.revokedAt,
        createdAt: apiKeys.createdAt,
        updatedAt: apiKeys.updatedAt,
        createdBy: {
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(apiKeys)
      .leftJoin(users, eq(apiKeys.createdById, users.id))
      .orderBy(desc(apiKeys.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    return handleRouteError('[API_KEYS_GET]', error);
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireApiPermission('api-key', 'create');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, apiKeyCreateSchema);
    if (!parsed.ok) return parsed.response;

    const rawKey = generateApiKey();
    const [created] = await db
      .insert(apiKeys)
      .values({
        name: parsed.data.name,
        keyPrefix: getApiKeyPrefix(rawKey),
        keyHash: hashToken(rawKey),
        scopes: parsed.data.scopes,
        expiresAt: parsed.data.expiresAt,
        createdById: authz.session.user.id,
      })
      .returning();

    await writeAuditLog({
      sessionUser: authz.session.user,
      request,
      action: 'api_key.create',
      resource: 'api-key',
      resourceId: created.id,
      message: `API key created: ${created.name}`,
      metadata: { scopes: parsed.data.scopes },
    });

    return NextResponse.json({ ...created, key: rawKey }, { status: 201 });
  } catch (error) {
    return handleRouteError('[API_KEYS_POST]', error);
  }
}
