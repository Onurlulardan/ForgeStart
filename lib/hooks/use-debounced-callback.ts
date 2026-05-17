'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

type AnyFn = (...args: never[]) => unknown;

export interface DebouncedCallback<T extends AnyFn> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

export function useDebouncedCallback<T extends AnyFn>(callback: T, delay = 300): DebouncedCallback<T> {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return useMemo(() => {
    const fn = ((...args: Parameters<T>) => debounced(...args)) as DebouncedCallback<T>;
    fn.cancel = cancel;
    return fn;
  }, [debounced, cancel]);
}
