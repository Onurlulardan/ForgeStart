'use client';

import { io, type Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from './types';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

export interface RealtimeClientOptions {
  url?: string;
  withCredentials?: boolean;
}

export function getRealtimeClient(options: RealtimeClientOptions = {}): AppSocket {
  if (socket && socket.connected) return socket;
  const url =
    options.url ??
    process.env.NEXT_PUBLIC_REALTIME_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000');
  if (socket) {
    socket.connect();
    return socket;
  }
  socket = io(url, {
    transports: ['websocket', 'polling'],
    withCredentials: options.withCredentials ?? true,
    autoConnect: true,
  });
  return socket;
}

export function disconnectRealtimeClient(): void {
  socket?.disconnect();
  socket = null;
}
