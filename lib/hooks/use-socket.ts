'use client';

import { useEffect, useState } from 'react';
import { getRealtimeClient, type AppSocket } from '@/lib/realtime';

export interface UseSocketReturn {
  socket: AppSocket;
  connected: boolean;
}

export function useSocket(): UseSocketReturn {
  const [socket] = useState<AppSocket>(() => getRealtimeClient());
  const [connected, setConnected] = useState<boolean>(() => socket.connected);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  return { socket, connected };
}
