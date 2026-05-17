'use client';

import { useState } from 'react';
import { CameraIcon, Loader2Icon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/lib/hooks';
import { UploadKind, type Upload } from '@/db/types';
import { uploadsApi } from '@/lib/api/client/uploads';

export interface AvatarUploaderProps {
  currentUrl?: string | null;
  currentUploadId?: string | null;
  fallback: string;
  onUploaded: (upload: Upload) => void | Promise<void>;
  onRemoved?: () => void | Promise<void>;
  size?: number;
  disabled?: boolean;
}

export function AvatarUploader({
  currentUrl,
  currentUploadId,
  fallback,
  onUploaded,
  onRemoved,
  size = 96,
  disabled = false,
}: AvatarUploaderProps) {
  const t = useTranslations('uploads');
  const [removing, setRemoving] = useState(false);

  const { upload, isUploading, progress, error } = useFileUpload({
    kind: UploadKind.AVATAR,
    onSuccess: (result) => {
      void onUploaded(result);
    },
  });

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await upload(file, currentUploadId ?? undefined);
  };

  const handleRemove = async () => {
    if (!currentUploadId) return;
    setRemoving(true);
    try {
      await uploadsApi.remove(currentUploadId);
      await onRemoved?.();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar style={{ width: size, height: size }}>
          <AvatarImage src={currentUrl ?? undefined} alt={fallback} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 text-xs font-medium">
            <Loader2Icon className="size-5 animate-spin text-primary" />
            <span className="ml-2">{progress}%</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label className="inline-flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            render={
              <span className="cursor-pointer">
                <CameraIcon />
                {t('changeAvatar')}
              </span>
            }
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled || isUploading}
            onChange={handleSelect}
          />
        </label>
        {currentUploadId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || removing}
            onClick={handleRemove}
          >
            {removing ? <Loader2Icon className="animate-spin" /> : <Trash2Icon />}
            {t('removeAvatar')}
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
