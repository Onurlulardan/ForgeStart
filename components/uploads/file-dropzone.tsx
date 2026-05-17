'use client';

import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { UploadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  hint?: string;
  onFiles: (files: File[]) => void;
  className?: string;
}

export function FileDropzone({
  accept,
  multiple = false,
  disabled = false,
  hint,
  onFiles,
  className,
}: FileDropzoneProps) {
  const t = useTranslations('uploads');
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const files = multiple ? Array.from(list) : [list[0]!];
      onFiles(files);
    },
    [multiple, onFiles]
  );

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setHovered(false);
    if (disabled) return;
    handleFiles(event.dataTransfer.files);
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = '';
  };

  return (
    <div
      role="group"
      aria-disabled={disabled}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setHovered(true);
      }}
      onDragLeave={() => setHovered(false)}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-10 text-center transition-colors',
        hovered && !disabled && 'border-primary bg-primary/5',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UploadIcon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{t('dropzoneTitle')}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {t('chooseFile')}
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleSelect}
      />
    </div>
  );
}
