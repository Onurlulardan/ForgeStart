'use client';

import { useEffect, useState } from 'react';
import { useSocket } from './use-socket';

export interface UsePresenceReturn {
  online: string[];
}

export function usePresence(room: string): UsePresenceReturn {
  const { socket, connected } = useSocket();
  const [online, setOnline] = useState<string[]>([]);

  useEffect(() => {
    if (!connected || !room) return;

    const handleUpdate = (payload: { room: string; userIds: string[] }) => {
      if (payload.room === room) setOnline(payload.userIds);
    };

    socket.emit('room:join', room);
    socket.on('presence:update', handleUpdate);
    socket.emit('presence:ping', room);

    return () => {
      socket.off('presence:update', handleUpdate);
      socket.emit('room:leave', room);
    };
  }, [socket, connected, room]);

  return { online };
}
