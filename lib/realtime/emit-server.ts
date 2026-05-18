import 'server-only';
import { env } from '../../env';
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
  return env.REALTIME_URL ?? `http://localhost:${env.REALTIME_PORT}`;
}

export async function emitToRealtime<T extends keyof ServerToClientEvents>(
  input: ServerEmitInput<T>
): Promise<ServerEmitResult> {
  try {
    const response = await fetch(`${realtimeUrl().replace(/\/+$/, '')}/internal/emit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AUTH_SECRET}`,
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) return { ok: false, delivered: false };
    return { ok: true, delivered: true };
  } catch {
    return { ok: false, delivered: false };
  }
}
