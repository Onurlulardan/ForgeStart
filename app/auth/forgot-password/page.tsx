import { getTranslations } from 'next-intl/server';
import ForgotPasswordForm from './forgot-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth');

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <CardTitle>{t('forgotPasswordTitle')}</CardTitle>
          <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
