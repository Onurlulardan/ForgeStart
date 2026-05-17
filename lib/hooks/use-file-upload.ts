'use client';

import { useCallback, useRef, useState } from 'react';
import { uploadsApi } from '@/lib/api/client/uploads';
import type { Upload, UploadKind } from '@/db/types';

export interface UseFileUploadOptions {
  kind?: UploadKind;
  onSuccess?: (upload: Upload) => void;
  onError?: (error: Error) => void;
}

export interface UseFileUploadReturn {
  upload: (file: File, replaceUploadId?: string) => Promise<Upload | null>;
  abort: () => void;
  reset: () => void;
  isUploading: boolean;
  progress: number;
  error: Error | null;
  data: Upload | null;
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [isUploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Upload | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (file: File, replaceUploadId?: string) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const result = await uploadsApi.upload(file, {
          kind: options.kind,
          replaceUploadId,
          signal: controller.signal,
          onProgress: (event) => setProgress(event.percent),
        });
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const wrapped = err instanceof Error ? err : new Error(String(err));
        setError(wrapped);
        options.onError?.(wrapped);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [options]
  );

  const abort = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setUploading(false);
    setProgress(0);
    setError(null);
    setData(null);
  }, []);

  return { upload, abort, reset, isUploading, progress, error, data };
}
