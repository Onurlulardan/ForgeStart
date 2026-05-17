'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { LockIcon, MailIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { z } from 'zod';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Form, FormField, SubmitButton } from '@/components/forms';
import { Link } from '@/i18n/navigation';
import { authApi } from '@/lib/api/client';
import { registerSchema } from '@/lib/validation/admin';
import { useNotification } from '@/contexts/NotificationContext';
import type { RegisterInput } from '@/lib/api/client';

export default function RegisterForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { showNotification } = useNotification();
  const schema = registerSchema as unknown as z.ZodType<RegisterInput>;

  const submit = async (values: RegisterInput) => {
    await authApi.register(values);
    showNotification('success', t('registerSuccess'));
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (!result?.error) {
      router.push('/dashboard');
    }
  };

  const defaultValues: RegisterInput = {
    email: '',
    password: '',
    firstName: null,
    lastName: null,
    phone: null,
  };

  return (
    <Form<RegisterInput>
      schema={schema}
      defaultValues={defaultValues as never}
      onSubmit={submit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField<RegisterInput> name="firstName" label={t('firstNameLabel')}>
          {(field) => (
            <InputGroup>
              <InputGroupAddon>
                <UserIcon />
              </InputGroupAddon>
              <InputGroupInput
                id={field.name}
                value={(field.value as string | null | undefined) ?? ''}
                onChange={(event) => field.onChange(event.target.value || null)}
                onBlur={field.onBlur}
                autoComplete="given-name"
              />
            </InputGroup>
          )}
        </FormField>
        <FormField<RegisterInput> name="lastName" label={t('lastNameLabel')}>
          {(field) => (
            <InputGroup>
              <InputGroupAddon>
                <UserIcon />
              </InputGroupAddon>
              <InputGroupInput
                id={field.name}
                value={(field.value as string | null | undefined) ?? ''}
                onChange={(event) => field.onChange(event.target.value || null)}
                onBlur={field.onBlur}
                autoComplete="family-name"
              />
            </InputGroup>
          )}
        </FormField>
      </div>
      <FormField<RegisterInput> name="email" label={t('emailLabel')}>
        {(field) => (
          <InputGroup>
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              type="email"
              autoComplete="email"
              value={(field.value as string | undefined) ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
          </InputGroup>
        )}
      </FormField>
      <FormField<RegisterInput> name="password" label={t('passwordLabel')}>
        {(field) => (
          <InputGroup>
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={(field.value as string | undefined) ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
          </InputGroup>
        )}
      </FormField>
      <FormField<RegisterInput> name="phone" label={t('phoneLabel')}>
        {(field) => (
          <InputGroup>
            <InputGroupAddon>
              <PhoneIcon />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              autoComplete="tel"
              value={(field.value as string | null | undefined) ?? ''}
              onChange={(event) => field.onChange(event.target.value || null)}
              onBlur={field.onBlur}
            />
          </InputGroup>
        )}
      </FormField>
      <SubmitButton className="w-full">{t('submitRegister')}</SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t('loginLink')}
        </Link>
      </p>
    </Form>
  );
}
