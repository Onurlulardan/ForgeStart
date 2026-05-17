import { getTranslations } from 'next-intl/server';
import ResetPasswordForm from './reset-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const t = await getTranslations('auth');

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <CardTitle>{t('resetPasswordTitle')}</CardTitle>
          <CardDescription>{t('resetPasswordDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
