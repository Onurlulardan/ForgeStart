'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LockIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Form, FormField, SubmitButton } from '@/components/forms';
import { Link } from '@/i18n/navigation';
import { passwordResetConfirmSchema } from '@/lib/validation/admin';
import { authApi, type PasswordResetConfirmInput } from '@/lib/api/client';
import { useNotification } from '@/contexts/NotificationContext';

export default function ResetPasswordForm() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const [done, setDone] = useState(false);
  const { showNotification } = useNotification();
  const schema = passwordResetConfirmSchema as unknown as z.ZodType<PasswordResetConfirmInput>;

  const submit = async (values: PasswordResetConfirmInput) => {
    await authApi.passwordResetConfirm(values);
    showNotification('success', t('resetSuccess'));
    setDone(true);
  };

  return (
    <Form<PasswordResetConfirmInput>
      schema={schema}
      defaultValues={{
        token: searchParams.get('token') ?? '',
        password: '',
      }}
      onSubmit={submit}
    >
      <FormField<PasswordResetConfirmInput> name="token" label="Token">
        {(field) => (
          <InputGroup>
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              value={(field.value as string | undefined) ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
          </InputGroup>
        )}
      </FormField>
      <FormField<PasswordResetConfirmInput> name="password" label={t('newPasswordLabel')}>
        {(field) => (
          <InputGroup>
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              type="password"
              minLength={8}
              value={(field.value as string | undefined) ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
          </InputGroup>
        )}
      </FormField>
      {done ? (
        <Button render={<Link href="/auth/login" />}>{t('loginLink')}</Button>
      ) : (
        <SubmitButton>{t('submitReset')}</SubmitButton>
      )}
    </Form>
  );
}
