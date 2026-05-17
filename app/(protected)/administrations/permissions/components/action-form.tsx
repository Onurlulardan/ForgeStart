'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Form, FormInput, FormTextarea, SubmitButton } from '@/components/forms';
import { actionSchema } from '@/lib/validation/admin';
import type { Action, ActionInput } from '@/lib/api/client';

export interface ActionFormProps {
  initialValues?: Action | null;
  onSubmit: (values: ActionInput) => Promise<void>;
}

export function ActionForm({ initialValues, onSubmit }: ActionFormProps) {
  const tCommon = useTranslations('common');
  const schema = actionSchema as unknown as z.ZodType<ActionInput>;

  const defaultValues = useMemo<ActionInput>(
    () => ({
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      description: initialValues?.description ?? null,
    }),
    [initialValues]
  );

  return (
    <Form<ActionInput>
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
