'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Form, FormInput, FormTextarea, SubmitButton } from '@/components/forms';
import { resourceSchema } from '@/lib/validation/admin';
import type { Resource, ResourceInput } from '@/lib/api/client';

export interface ResourceFormProps {
  initialValues?: Resource | null;
  onSubmit: (values: ResourceInput) => Promise<void>;
}

export function ResourceForm({ initialValues, onSubmit }: ResourceFormProps) {
  const tCommon = useTranslations('common');
  const schema = resourceSchema as unknown as z.ZodType<ResourceInput>;

  const defaultValues = useMemo<ResourceInput>(
    () => ({
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      description: initialValues?.description ?? null,
    }),
    [initialValues]
  );

  return (
    <Form<ResourceInput>
      schema={schema}
      defaultValues={defaultValues as never}
      values={defaultValues as never}
      onSubmit={onSubmit}
    >
      <FormInput name="name" label={tCommon('name')} minLength={3} />
      <FormInput name="slug" label={tCommon('slug')} pattern="^[a-z0-9-_]+$" />
      <FormTextarea name="description" label={tCommon('description')} rows={4} />
      <SubmitButton className="w-full">
        {initialValues ? tCommon('update') : tCommon('create')}
      </SubmitButton>
    </Form>
  );
}
