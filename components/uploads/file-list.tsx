'use client';

import { useState } from 'react';
import { uploadsApi } from '@/lib/api/client/uploads';
import type { Upload } from '@/db/types';
import { UploadPreview } from './upload-preview';

interface FileListProps {
  uploads: Upload[];
  onChange?: (uploads: Upload[]) => void;
}

export function FileList({ uploads, onChange }: FileListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (upload: Upload) => {
    setRemovingId(upload.id);
    try {
      await uploadsApi.remove(upload.id);
      onChange?.(uploads.filter((u) => u.id !== upload.id));
    } finally {
      setRemovingId(null);
    }
  };

  if (uploads.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {uploads.map((upload) => (
        <UploadPreview
          key={upload.id}
          upload={upload}
          onRemove={handleRemove}
          removing={removingId === upload.id}
        />
      ))}
    </div>
  );
}
