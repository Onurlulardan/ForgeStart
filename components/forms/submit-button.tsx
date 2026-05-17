'use client';

import { type ComponentProps, type ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { Loader2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export interface SubmitButtonProps extends ComponentProps<typeof Button> {
  pendingLabel?: ReactNode;
}

export function SubmitButton({ children, pendingLabel, disabled, ...props }: SubmitButtonProps) {
  const { formState } = useFormContext();
  const t = useTranslations('common');
  const isPending = formState.isSubmitting;

  return (
    <Button type="submit" disabled={disabled || isPending} {...props}>
      {isPending && <Loader2Icon className="animate-spin" />}
      {isPending ? (pendingLabel ?? t('saving')) : children}
    </Button>
  );
}
