'use client';

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function createStorageHook(storageType: 'localStorage' | 'sessionStorage') {
  return function useStorage<T>(
    key: string,
    initialValue: T
  ): [T, Dispatch<SetStateAction<T>>, () => void] {
    const [value, setValue] = useState<T>(initialValue);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      if (typeof window === 'undefined') return;
      const raw = window[storageType].getItem(key);
      if (raw !== null) {
        setValue(safeParse<T>(raw, initialValue));
      }
      setHydrated(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    useEffect(() => {
      if (!hydrated || typeof window === 'undefined') return;
      window[storageType].setItem(key, JSON.stringify(value));
    }, [key, value, hydrated]);

    const remove = useCallback(() => {
      if (typeof window === 'undefined') return;
      window[storageType].removeItem(key);
      setValue(initialValue);
    }, [key, initialValue]);

    return [value, setValue, remove];
  };
}

export const useLocalStorage = createStorageHook('localStorage');
export const useSessionStorage = createStorageHook('sessionStorage');
