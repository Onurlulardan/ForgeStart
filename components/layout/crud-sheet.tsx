'use client';

import { type ReactNode, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { UnsavedChangesDialog } from '@/components/forms/unsaved-changes-dialog';
import { cn } from '@/lib/utils';

export interface CrudSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  isDirty?: boolean;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
  children: ReactNode;
}

export function CrudSheet({
  open,
  onOpenChange,
  title,
  description,
  isDirty = false,
  side = 'right',
  className,
  children,
}: CrudSheetProps) {
  const [confirmingClose, setConfirmingClose] = useState(false);

  const handleSheetOpenChange = (next: boolean) => {
    if (!next && isDirty) {
      setConfirmingClose(true);
      return;
    }
    onOpenChange(next);
  };

  const discard = () => {
    setConfirmingClose(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent side={side} className={cn('w-full overflow-y-auto sm:max-w-2xl', className)}>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="px-4 pb-4">{children}</div>
        </SheetContent>
      </Sheet>
      <UnsavedChangesDialog
        open={confirmingClose}
        onConfirm={discard}
        onCancel={() => setConfirmingClose(false)}
      />
    </>
  );
}
