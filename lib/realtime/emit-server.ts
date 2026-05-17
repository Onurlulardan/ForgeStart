import 'server-only';
import type { ServerToClientEvents } from './types';

export interface ServerEmitInput<T extends keyof ServerToClientEvents> {
  event: T;
  payload: Parameters<ServerToClientEvents[T]>[0];
  room?: string;
}

export interface ServerEmitResult {
  ok: boolean;
  delivered: boolean;
}

function realtimeUrl(): string {
  return process.env.REALTIME_URL ?? `http://localhost:${process.env.REALTIME_PORT ?? 4000}`;
}

export async function emitToRealtime<T extends keyof ServerToClientEvents>(
  input: ServerEmitInput<T>
): Promise<ServerEmitResult> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return { ok: false, delivered: false };

  try {
    const response = await fetch(`${realtimeUrl().replace(/\/+$/, '')}/internal/emit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) return { ok: false, delivered: false };
    return { ok: true, delivered: true };
  } catch {
    return { ok: false, delivered: false };
  }
}
