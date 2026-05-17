'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { LockIcon, MailIcon } from 'lucide-react';
import { z } from 'zod';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Form, FormField, SubmitButton } from '@/components/forms';
import { Link } from '@/i18n/navigation';
import { useNotification } from '@/contexts/NotificationContext';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const { showNotification } = useNotification();

  const submit = async (values: LoginFormValues) => {
    const result = await signIn('credentials', {
      email: values.email.toLowerCase(),
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      showNotification('error', t('invalidCredentials'));
      return;
    }

    showNotification('success', t('loginSuccess'));
    router.push(callbackUrl);
  };

  return (
    <Form<LoginFormValues>
      schema={loginSchema}
      defaultValues={{ email: '', password: '' }}
      onSubmit={submit}
    >
      <FormField<LoginFormValues> name="email" label={t('emailLabel')}>
        {(field) => (
          <InputGroup>
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={(field.value as string | undefined) ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
          </InputGroup>
        )}
      </FormField>
      <FormField<LoginFormValues> name="password" label={t('passwordLabel')}>
        {(field) => (
          <InputGroup>
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              type="password"
              autoComplete="current-password"
              value={(field.value as string | undefined) ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
          </InputGroup>
        )}
      </FormField>
      <SubmitButton className="w-full">{t('submitLogin')}</SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/auth/forgot-password"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t('forgotPassword')}
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link
          href="/auth/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t('registerLink')}
        </Link>
      </p>
    </Form>
  );
}
