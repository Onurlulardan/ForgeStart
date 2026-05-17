'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Resource } from '@/db/types';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface ResourceFormData {
  name: string;
  slug: string;
  description: string | null;
}

interface ResourceFormProps {
  initialValues?: Resource | null;
  onSubmit: (values: ResourceFormData) => Promise<void>;
  loading?: boolean;
}

const emptyForm: ResourceFormData = {
  name: '',
  slug: '',
  description: null,
};

export function ResourceForm({ initialValues, onSubmit, loading }: ResourceFormProps) {
  const [values, setValues] = useState<ResourceFormData>(emptyForm);

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
          <FieldLabel htmlFor="resourceName">Resource name</FieldLabel>
          <Input
            id="resourceName"
            value={values.name}
            minLength={3}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="resourceSlug">Slug</FieldLabel>
          <Input
            id="resourceSlug"
            pattern="^[a-z0-9-_]+$"
            value={values.slug}
            onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="resourceDescription">Description</FieldLabel>
          <Textarea
            id="resourceDescription"
            rows={4}
            value={values.description ?? ''}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value || null }))
            }
          />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : initialValues ? 'Update resource' : 'Create resource'}
        </Button>
      </FieldGroup>
    </form>
  );
}
