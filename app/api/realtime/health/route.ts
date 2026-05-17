import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.REALTIME_URL ?? `http://localhost:${process.env.REALTIME_PORT ?? 4000}`;
  try {
    const response = await fetch(`${url.replace(/\/+$/, '')}/health`, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json(
        { ok: false, status: response.status, url },
        { status: 503 }
      );
    }
    const body = (await response.json()) as { ok: boolean; ts: string };
    return NextResponse.json({ ok: body.ok, ts: body.ts, url });
  } catch (error) {
    return NextResponse.json(
      { ok: false, url, error: error instanceof Error ? error.message : 'unknown' },
      { status: 503 }
    );
  }
}
