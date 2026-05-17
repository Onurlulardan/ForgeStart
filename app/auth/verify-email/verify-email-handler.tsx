'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { postRequest } from '@/lib/apiClient';

type Status = 'idle' | 'pending' | 'success' | 'error';

interface ResultPayload {
  ok: boolean;
  reason?: string;
  userId?: string;
}

export function VerifyEmailHandler() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('idle');
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setReason('missing-token');
      return;
    }
    let active = true;
    setStatus('pending');
    postRequest<ResultPayload>('/auth/verify-email', { token })
      .then(() => {
        if (active) setStatus('success');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setStatus('error');
        setReason(err instanceof Error ? err.message : 'verify-failed');
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      {status === 'pending' && (
        <>
          <Loader2Icon className="size-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle2Icon className="size-12 text-emerald-500" />
          <p className="text-sm font-medium">{t('verifySuccess')}</p>
          <Button render={<Link href="/auth/login" />}>{t('loginLink')}</Button>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircleIcon className="size-12 text-destructive" />
          <p className="text-sm font-medium">{t('verifyFailed')}</p>
          {reason && <p className="text-xs text-muted-foreground">{reason}</p>}
          <Button render={<Link href="/auth/login" />} variant="outline">
            {t('loginLink')}
          </Button>
        </>
      )}
    </div>
  );
}
