'use client';

import { useState } from 'react';
import { MailIcon, XIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { postRequest } from '@/lib/apiClient';
import { toast } from 'sonner';

export function VerifyEmailBanner() {
  const { data: session } = useSession();
  const t = useTranslations('auth');
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (!session?.user || session.user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await postRequest('/auth/verify-email/resend', {});
      toast.success(t('verifyResendSent'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('verifyResendFailed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:text-amber-200">
      <div className="flex items-start gap-3">
        <MailIcon className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-medium">{t('verifyBannerTitle')}</p>
          <p className="text-xs opacity-80">{t('verifyBannerDescription')}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={sending} onClick={handleResend}>
          {sending ? t('verifyResendSending') : t('verifyResend')}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="dismiss"
          onClick={() => setDismissed(true)}
        >
          <XIcon />
        </Button>
      </div>
    </div>
  );
}
