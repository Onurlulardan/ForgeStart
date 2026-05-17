import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VerifyEmailHandler } from './verify-email-handler';

export default async function VerifyEmailPage() {
  const t = await getTranslations('auth');

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--accent),transparent_32rem),var(--background)] px-4 py-12">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <CardTitle>{t('emailVerificationTitle')}</CardTitle>
          <CardDescription>{t('emailVerificationDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyEmailHandler />
        </CardContent>
      </Card>
    </main>
  );
}
