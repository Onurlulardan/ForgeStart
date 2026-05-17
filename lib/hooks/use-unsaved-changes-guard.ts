'use client';

import { useEffect } from 'react';

export function useUnsavedChangesGuard(isDirty: boolean, message?: string) {
  useEffect(() => {
    if (!isDirty || typeof window === 'undefined') return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      if (message) {
        event.returnValue = message;
      }
      return message;
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, message]);
}
