'use client';

import { useEffect } from 'react';
import { useSocket } from './use-socket';
import type { ServerToClientEvents } from '@/lib/realtime/types';

export function useSocketEvent<T extends keyof ServerToClientEvents>(
  event: T,
  handler: ServerToClientEvents[T]
): void {
  const { socket } = useSocket();

  useEffect(() => {
    socket.on(event, handler as never);
    return () => {
      socket.off(event, handler as never);
    };
  }, [socket, event, handler]);
}
