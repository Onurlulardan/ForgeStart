import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';

const emitSchema = z.object({
  event: z.string().min(1),
  payload: z.unknown(),
  room: z.string().optional(),
});

interface EmitBody {
  event: string;
  payload: unknown;
  room?: string;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return jsonError('Unauthorized', 401);
    if (!hasSessionPermission(session.user, 'realtime', 'emit')) {
      return jsonError('Forbidden', 403);
    }

    const parsed = await parseJson(request, emitSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data as EmitBody;

    const realtimeUrl =
      process.env.REALTIME_URL ?? `http://localhost:${process.env.REALTIME_PORT ?? 4000}`;
    const response = await fetch(`${realtimeUrl.replace(/\/+$/, '')}/internal/emit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AUTH_SECRET ?? ''}`,
      },
      body: JSON.stringify(body),
    }).catch(() => null);

    if (!response || !response.ok) {
      return NextResponse.json(
        {
          ok: false,
          delivered: false,
          message: 'Realtime server not reachable; event not delivered.',
        },
        { status: 202 }
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    return handleRouteError('[REALTIME_EMIT_POST]', error);
  }
}
