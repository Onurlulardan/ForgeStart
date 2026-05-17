'use client';

import { useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

export const useNotificationSetup = () => {
  const { showNotification } = useNotification();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__showNotification = showNotification;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.__showNotification;
      }
    };
  }, [showNotification]);
};
