'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Form, FormInput, FormSelect, SubmitButton } from '@/components/forms';
import { organizationSchema } from '@/lib/validation/admin';
import { useAvailableParents } from '@/lib/query';
import { OrgStatus } from '@/db/types';
import type { Organization, OrganizationInput } from '@/lib/api/client';

const NO_PARENT_VALUE = '__no_parent__';

export interface OrganizationFormProps {
  initialValues?: Organization | null;
  onSubmit: (values: OrganizationInput) => Promise<void>;
}

export function OrganizationForm({ initialValues, onSubmit }: OrganizationFormProps) {
  const t = useTranslations('admin.organizations');
  const tCommon = useTranslations('common');
  const tStatus = useTranslations('status');
  const { data: parents = [] } = useAvailableParents(initialValues?.id);
  const schema = organizationSchema as unknown as z.ZodType<OrganizationInput>;

  const defaultValues = useMemo<OrganizationInput>(
    () => ({
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      status: initialValues?.status ?? OrgStatus.ACTIVE,
      parentId: initialValues?.parentId ?? null,
    }),
    [initialValues]
  );

  return (
    <Form<OrganizationInput>
      schema={schema}
      defaultValues={defaultValues as never}
      values={defaultValues as never}
      onSubmit={onSubmit}
    >
      <FormInput name="name" label={tCommon('name')} />
      <FormInput name="slug" label={tCommon('slug')} pattern="^[a-z0-9-]+$" />
      <FormSelect
        name="status"
        label={tCommon('status')}
        options={[
          { value: OrgStatus.ACTIVE, label: tStatus('active') },
          { value: OrgStatus.INACTIVE, label: tStatus('inactive') },
          { value: OrgStatus.SUSPENDED, label: tStatus('suspended') },
        ]}
      />
      <FormSelect
        name="parentId"
        label={t('parentLabel')}
        options={[
          { value: NO_PARENT_VALUE, label: t('noParent') },
          ...parents.map((organization) => ({
            value: organization.id,
            label: organization.name,
          })),
        ]}
        emptyValue={NO_PARENT_VALUE}
        placeholder={t('parentLabel')}
      />
      <SubmitButton className="w-full">
        {initialValues ? tCommon('update') : tCommon('create')}
      </SubmitButton>
    </Form>
  );
}
