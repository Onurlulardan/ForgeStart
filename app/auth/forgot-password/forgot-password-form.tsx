'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyIcon, MailIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Form, FormField, SubmitButton } from '@/components/forms';
import { Link } from '@/i18n/navigation';
import { passwordResetRequestSchema } from '@/lib/validation/admin';
import { postRequest } from '@/lib/apiClient';
import { useClipboard } from '@/lib/hooks';
import { useNotification } from '@/contexts/NotificationContext';
import type { PasswordResetRequestInput } from '@/lib/api/client';

export default function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const { copy, copied } = useClipboard();
  const { showNotification } = useNotification();
  const schema = passwordResetRequestSchema as unknown as z.ZodType<PasswordResetRequestInput>;

  const submit = async (values: PasswordResetRequestInput) => {
    const response = await postRequest<{ ok: boolean; resetUrl?: string }>(
      '/auth/password-reset',
      values
    );
    setResetUrl(response.resetUrl ?? null);
    showNotification('success', t('forgotSuccess'));
  };

  return (
    <Form<PasswordResetRequestInput>
      schema={schema}
      defaultValues={{ email: '' }}
      onSubmit={submit}
    >
      <FormField<PasswordResetRequestInput>
        name="email"
        label={t('emailLabel')}
        description={t('forgotPasswordDescription')}
      >
        {(field) => (
          <InputGroup>
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput
              id={field.name}
              type="email"
              value={(field.value as string | undefined) ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            />
          </InputGroup>
        )}
      </FormField>
      {resetUrl && (
        <Field>
          <FieldLabel htmlFor="resetUrl">{tCommon('details')}</FieldLabel>
          <div className="flex gap-2">
            <Input id="resetUrl" value={resetUrl} readOnly />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => copy(resetUrl)}
              aria-label={tCommon('copy')}
            >
              <CopyIcon />
            </Button>
          </div>
          {copied && <FieldDescription>{tCommon('copied')}</FieldDescription>}
        </Field>
      )}
      <SubmitButton>{t('submitForgot')}</SubmitButton>
      <Button render={<Link href="/auth/login" />} type="button" variant="link">
        {t('loginLink')}
      </Button>
    </Form>
  );
}
