import { deleteRequest, getRequest } from '@/lib/apiClient';
import type { Upload, UploadKind } from '@/db/types';

const BASE = '/uploads';

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percent: number;
}

export interface UploadOptions {
  kind?: UploadKind;
  replaceUploadId?: string;
  onProgress?: (event: UploadProgressEvent) => void;
  signal?: AbortSignal;
}

export const uploadsApi = {
  list: () => getRequest<Upload[]>(BASE),
  get: (id: string) => getRequest<Upload & { url: string | null }>(`${BASE}/${id}`),
  remove: (id: string) => deleteRequest<void>(`${BASE}/${id}`),
  upload: async (file: File, options: UploadOptions = {}): Promise<Upload> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options.kind) formData.append('kind', options.kind);
    if (options.replaceUploadId) formData.append('replaceUploadId', options.replaceUploadId);

    return new Promise<Upload>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/uploads');
      xhr.responseType = 'json';

      if (options.onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (event) => {
          if (!event.lengthComputable) return;
          options.onProgress?.({
            loaded: event.loaded,
            total: event.total,
            percent: Math.round((event.loaded / event.total) * 100),
          });
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response as Upload);
        } else {
          const message =
            (xhr.response as { error?: string } | null)?.error ??
            xhr.statusText ??
            'Upload failed';
          reject(new Error(message));
        }
      });
      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      options.signal?.addEventListener('abort', () => xhr.abort());

      xhr.send(formData);
    });
  },
};
