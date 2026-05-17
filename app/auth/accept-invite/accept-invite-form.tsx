'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LockIcon, UserIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Form, FormField, SubmitButton } from '@/components/forms';
import { Link } from '@/i18n/navigation';
import { inviteAcceptSchema } from '@/lib/validation/admin';
import { authApi, type InviteAcceptInput } from '@/lib/api/client';

export default function AcceptInviteForm() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const [done, setDone] = useState(false);
  const schema = inviteAcceptSchema as unknown as z.ZodType<InviteAcceptInput>;

  const submit = async (values: InviteAcceptInput) => {
    await authApi.acceptInvite(values);
    setDone(true);
  };

  return (
    <Form<InviteAcceptInput>
      schema={schema}
      defaultValues={{
        token: searchParams.get('token') ?? '',
        password: '',
        firstName: '',
        lastName: '',
      }}
      onSubmit={submit}
    >
      <FormField<InviteAcceptInput> name="token" label="Token">
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField<InviteAcceptInput> name="firstName" label={t('firstNameLabel')}>
          {(field) => (
            <InputGroup>
              <InputGroupAddon>
                <UserIcon />
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
        <FormField<InviteAcceptInput> name="lastName" label={t('lastNameLabel')}>
          {(field) => (
            <InputGroup>
              <InputGroupAddon>
                <UserIcon />
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
      </div>
      <FormField<InviteAcceptInput> name="password" label={t('passwordLabel')}>
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
        <SubmitButton>{t('submitAccept')}</SubmitButton>
      )}
    </Form>
  );
}
