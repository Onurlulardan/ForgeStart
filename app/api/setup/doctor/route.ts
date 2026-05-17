import { NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/system/health';

function mask(value?: string) {
  if (!value) return null;
  if (value.length <= 8) return 'set';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export async function GET() {
  let health: Awaited<ReturnType<typeof getHealthStatus>> | null = null;
  let databaseError: string | null = null;

  try {
    health = await getHealthStatus();
  } catch (error) {
    databaseError = error instanceof Error ? error.message : 'Database check failed';
  }

  return NextResponse.json({
    ok: Boolean(health?.ok),
    checkedAt: new Date().toISOString(),
    checks: [
      { name: 'DATABASE_URL', ok: Boolean(process.env.DATABASE_URL) },
      { name: 'AUTH_URL', ok: Boolean(process.env.AUTH_URL) },
      { name: 'NEXT_PUBLIC_APP_URL', ok: Boolean(process.env.NEXT_PUBLIC_APP_URL) },
      { name: 'AUTH_SECRET', ok: Boolean(process.env.AUTH_SECRET) },
    ],
    environment: {
      DATABASE_URL: mask(process.env.DATABASE_URL),
      AUTH_URL: process.env.AUTH_URL ?? null,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? null,
      APP_PORT: process.env.APP_PORT ?? process.env.PORT ?? null,
      AUTH_SECRET: process.env.AUTH_SECRET ? 'set' : null,
    },
    database: health?.database ?? { connected: false, error: databaseError },
  });
}
