'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import {
  Form,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
  SubmitButton,
} from '@/components/forms';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { roleSchema } from '@/lib/validation/admin';
import { useOrganizations } from '@/lib/query';
import type { Role, RoleInput } from '@/lib/api/client';

export interface RoleFormProps {
  initialValues?: Role | null;
  onSubmit: (values: RoleInput) => Promise<void>;
}

const GLOBAL_VALUE = '__global__';

export function RoleForm({ initialValues, onSubmit }: RoleFormProps) {
  const t = useTranslations('admin.roles');
  const tCommon = useTranslations('common');
  const { data: organizations = [], isLoading: loadingOrgs } = useOrganizations();
  const schema = roleSchema as unknown as z.ZodType<RoleInput>;

  const defaultValues = useMemo<RoleInput>(
    () => ({
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? null,
      isDefault: initialValues?.isDefault ?? false,
      organizationId: initialValues?.organizationId ?? null,
    }),
    [initialValues]
  );

  return (
    <Form<RoleInput>
      schema={schema}
      defaultValues={defaultValues as never}
      values={defaultValues as never}
      onSubmit={onSubmit}
    >
      <FormInput name="name" label={tCommon('name')} minLength={3} />
      <FormTextarea name="description" label={tCommon('description')} rows={4} maxLength={500} />
      <Field>
        <FieldLabel>{t('scopeGlobal')}</FieldLabel>
        <FormSelect
          name="organizationId"
          options={[
            { value: GLOBAL_VALUE, label: t('scopeGlobal') },
            ...organizations.map((organization) => ({
              value: organization.id,
              label: organization.name,
            })),
          ]}
          emptyValue={GLOBAL_VALUE}
          placeholder={t('scopeGlobal')}
          disabled={loadingOrgs}
        />
        <FieldDescription>
          {t('scopeGlobal')} — global roles apply across all organizations.
        </FieldDescription>
      </Field>
      <FormSwitch name="isDefault" label={t('isDefault')} />
      <SubmitButton className="w-full">
        {initialValues ? tCommon('update') : tCommon('create')}
      </SubmitButton>
    </Form>
  );
}
