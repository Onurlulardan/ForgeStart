'use client';

import { createContext, useContext } from 'react';
import { toast } from 'sonner';
import { ShowNotificationFunction } from '@/lib/apiClient/types/types';

interface NotificationContextType {
  showNotification: ShowNotificationFunction;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const showNotification: ShowNotificationFunction = (type, message, description) => {
    toast[type](message, { description });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
