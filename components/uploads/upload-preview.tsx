'use client';

import { FileIcon, Loader2Icon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/formatters';
import { isImage } from '@/lib/storage/validators';
import type { Upload } from '@/db/types';

export interface UploadPreviewProps {
  upload: Upload;
  onRemove?: (upload: Upload) => void | Promise<void>;
  removing?: boolean;
}

export function UploadPreview({ upload, onRemove, removing }: UploadPreviewProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
      {isImage(upload.mime) && upload.publicUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={upload.publicUrl}
          alt={upload.originalName}
          className="size-12 rounded-md object-cover"
        />
      ) : (
        <div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <FileIcon className="size-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{upload.originalName}</p>
        <p className="text-xs text-muted-foreground">
          {upload.mime} · {formatBytes(upload.size)}
        </p>
      </div>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={removing}
          onClick={() => onRemove(upload)}
          aria-label="Remove"
        >
          {removing ? <Loader2Icon className="animate-spin" /> : <Trash2Icon />}
        </Button>
      )}
    </div>
  );
}
