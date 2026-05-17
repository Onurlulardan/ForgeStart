'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Action } from '@/db/types';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface ActionFormData {
  name: string;
  slug: string;
  description: string | null;
}

interface ActionFormProps {
  initialValues?: Action | null;
  onSubmit: (values: ActionFormData) => Promise<void>;
  loading?: boolean;
}

const emptyForm: ActionFormData = {
  name: '',
  slug: '',
  description: null,
};

export function ActionForm({ initialValues, onSubmit, loading }: ActionFormProps) {
  const [values, setValues] = useState<ActionFormData>(emptyForm);

  useEffect(() => {
    setValues({
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      description: initialValues?.description ?? null,
    });
  }, [initialValues]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="actionName">Action name</FieldLabel>
          <Input
            id="actionName"
            value={values.name}
            minLength={3}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="actionSlug">Slug</FieldLabel>
          <Input
            id="actionSlug"
            pattern="^[a-z0-9-_]+$"
            value={values.slug}
            onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="actionDescription">Description</FieldLabel>
          <Textarea
            id="actionDescription"
            rows={4}
            value={values.description ?? ''}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value || null }))
            }
          />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : initialValues ? 'Update action' : 'Create action'}
        </Button>
      </FieldGroup>
    </form>
  );
}
