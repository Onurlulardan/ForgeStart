'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { postRequest } from '@/lib/apiClient';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await postRequest('/auth/password-reset/confirm', { token, password });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="token">Token</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </InputGroup>
        </Field>
        {done ? (
          <Button render={<Link href="/auth/login" />}>Sign in</Button>
        ) : (
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Set new password'}
          </Button>
        )}
      </FieldGroup>
    </form>
  );
}
