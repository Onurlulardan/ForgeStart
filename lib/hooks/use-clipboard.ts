'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseClipboardOptions {
  timeout?: number;
}

export interface UseClipboardReturn {
  copy: (value: string) => Promise<boolean>;
  copied: boolean;
  reset: () => void;
}

export function useClipboard({ timeout = 1500 }: UseClipboardOptions = {}): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    setCopied(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      try {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
          return false;
        }
        await navigator.clipboard.writeText(value);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        return false;
      }
    },
    [timeout]
  );

  return { copy, copied, reset };
}
