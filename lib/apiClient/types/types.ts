export interface RequestOptions {
  headers?: Record<string, string>;
  [key: string]: unknown;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface ShowNotificationFunction {
  (type: NotificationType, message: string, description?: string): void;
}

declare global {
  interface Window {
    __showNotification?: ShowNotificationFunction;
  }
}
