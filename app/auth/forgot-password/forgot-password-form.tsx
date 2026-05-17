'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { CopyIcon, MailIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { postRequest } from '@/lib/apiClient';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await postRequest<{ ok: boolean; resetUrl?: string }>(
        '/auth/password-reset',
        {
          email,
        }
      );
      setResetUrl(response.resetUrl ?? null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </InputGroup>
          <FieldDescription>Existing accounts receive a reset token.</FieldDescription>
        </Field>
        {resetUrl && (
          <Field>
            <FieldLabel htmlFor="resetUrl">Reset URL</FieldLabel>
            <div className="flex gap-2">
              <Input id="resetUrl" value={resetUrl} readOnly />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => navigator.clipboard.writeText(resetUrl)}
              >
                <CopyIcon />
              </Button>
            </div>
          </Field>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Requesting...' : 'Request reset link'}
        </Button>
        <Button render={<Link href="/auth/login" />} type="button" variant="link">
          Back to sign in
        </Button>
      </FieldGroup>
    </form>
  );
}
