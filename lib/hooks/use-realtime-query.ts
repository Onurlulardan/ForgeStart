'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSocketEvent } from './use-socket-event';

export function useRealtimeQueryInvalidator(): void {
  const queryClient = useQueryClient();

  useSocketEvent('resource:invalidate', (payload) => {
    payload.keys.forEach((key) => {
      const parts = key.split('.');
      queryClient.invalidateQueries({ queryKey: parts });
    });
  });
}
