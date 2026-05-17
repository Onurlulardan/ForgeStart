'use client';

import { type ReactNode } from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConfirmContext, useConfirmController } from '@/lib/hooks';

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const controller = useConfirmController();
  const { state, handleConfirm, handleCancel, handleOpenChange } = controller;
  const t = useTranslations('common');
  const isDestructive = state.variant === 'destructive';

  return (
    <ConfirmContext.Provider value={controller}>
      {children}
      <Dialog open={state.open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            {isDestructive && (
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangleIcon className="size-5" />
              </div>
            )}
            <DialogTitle>{state.title}</DialogTitle>
            {state.description && <DialogDescription>{state.description}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {state.cancelLabel ?? t('cancel')}
            </Button>
            <Button
              type="button"
              variant={isDestructive ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              {state.confirmLabel ?? t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
