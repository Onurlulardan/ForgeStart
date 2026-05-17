import { NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/system/health';

export async function GET() {
  try {
    const health = await getHealthStatus();
    return NextResponse.json(health, { status: health.ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}
