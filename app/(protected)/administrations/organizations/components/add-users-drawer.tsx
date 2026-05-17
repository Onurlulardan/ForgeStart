'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import {
  Form,
  FormMultiSelect,
  SubmitButton,
} from '@/components/forms';
import { CrudSheet } from '@/components/layout';
import { addUsersToOrganizationSchema } from '@/lib/validation/admin';
import { useAvailableUsers, useOrganizationMutations } from '@/lib/query';
import type {
  AddUsersToOrganizationInput,
  Organization,
} from '@/lib/api/client';

interface AddUsersDrawerProps {
  organization: Organization | null;
  open: boolean;
  onClose: () => void;
}

export function AddUsersDrawer({ organization, open, onClose }: AddUsersDrawerProps) {
  const t = useTranslations('admin.organizations');
  const tCommon = useTranslations('common');
  const { data: users = [], isLoading } = useAvailableUsers();
  const { addUsers } = useOrganizationMutations();
  const schema = addUsersToOrganizationSchema as unknown as z.ZodType<AddUsersToOrganizationInput>;

  const defaultValues = useMemo<AddUsersToOrganizationInput>(
    () => ({ userIds: [], roleId: null }),
    []
  );

  const handleSubmit = async (values: AddUsersToOrganizationInput) => {
    if (!organization) return;
    await addUsers.mutateAsync({ id: organization.id, data: values });
    onClose();
  };

  return (
    <CrudSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={`${t('addUsersTitle')} — ${organization?.name ?? ''}`}
      description={t('addUsersDescription')}
    >
      <Form<AddUsersToOrganizationInput>
        schema={schema}
        defaultValues={defaultValues as never}
        values={defaultValues as never}
        onSubmit={handleSubmit}
      >
        <FormMultiSelect
          name="userIds"
          label={tCommon('all')}
          options={users.map((user) => ({
            value: user.id,
            label: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
            description: user.email,
          }))}
          emptyText={isLoading ? tCommon('loading') : tCommon('noData')}
          disabled={isLoading}
        />
        <SubmitButton className="w-full">{t('addUsers')}</SubmitButton>
      </Form>
    </CrudSheet>
  );
}
