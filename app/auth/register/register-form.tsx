'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { LockIcon, MailIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { postRequest } from '@/lib/apiClient';
import { useNotification } from '@/contexts/NotificationContext';

type FormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
};

const initialValues: FormValues = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
};

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<FormValues>(initialValues);
  const router = useRouter();
  const { showNotification } = useNotification();

  const updateValue = (key: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      await postRequest('/api/auth/register', values);
      showNotification('success', 'Account created', 'Your workspace account is ready.');

      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        showNotification('error', 'Login failed', 'Account created but automatic login failed');
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      showNotification(
        'error',
        'Registration failed',
        error instanceof Error ? error.message : 'Failed to create account'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <UserIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="firstName"
                value={values.firstName}
                onChange={(event) => updateValue('firstName', event.target.value)}
                placeholder="Super"
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <UserIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="lastName"
                value={values.lastName}
                onChange={(event) => updateValue('lastName', event.target.value)}
                placeholder="Admin"
              />
            </InputGroup>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => updateValue('email', event.target.value)}
              placeholder="you@example.com"
              required
            />
          </InputGroup>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={values.password}
              onChange={(event) => updateValue('password', event.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </InputGroup>
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <PhoneIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="phone"
              value={values.phone}
              onChange={(event) => updateValue('phone', event.target.value)}
              placeholder="+1 555 000 0000"
            />
          </InputGroup>
        </Field>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
