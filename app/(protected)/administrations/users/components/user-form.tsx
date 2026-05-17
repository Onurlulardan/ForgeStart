'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import {
  Form,
  FormInput,
  FormMultiSelect,
  FormSelect,
  SubmitButton,
} from '@/components/forms';
import { Spinner } from '@/components/feedback';
import { createUserSchema, updateUserSchema } from '@/lib/validation/admin';
import { useRoles } from '@/lib/query';
import { UserStatus } from '@/db/types';
import type { CreateUserInput, UpdateUserInput, UserWithoutPassword } from '@/lib/api/client';

export type UserFormValues = CreateUserInput | UpdateUserInput;

export interface UserFormProps {
  initialValues?: UserWithoutPassword;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export function UserForm({ initialValues, onSubmit }: UserFormProps) {
  const tUsers = useTranslations('admin.users');
  const tAuth = useTranslations('auth');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');

  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const isEdit = Boolean(initialValues);
  const schema = (isEdit ? updateUserSchema : createUserSchema) as unknown as z.ZodType<UserFormValues>;

  const defaultValues = useMemo<UserFormValues>(() => {
    const defaultRoleId = roles.find((role) => role.isDefault)?.id;
    if (initialValues) {
      return {
        email: initialValues.email,
        password: '',
        firstName: initialValues.firstName,
        lastName: initialValues.lastName,
        phone: initialValues.phone,
        status: initialValues.status,
        roleIds: initialValues.userRoles?.map((ur) => ur.role.id) ?? [],
      } as UserFormValues;
    }
    return {
      email: '',
      password: '',
      firstName: null,
      lastName: null,
      phone: null,
      status: UserStatus.ACTIVE,
      roleIds: defaultRoleId ? [defaultRoleId] : [],
    } as UserFormValues;
  }, [initialValues, roles]);

  return (
    <Form<UserFormValues>
      schema={schema}
      defaultValues={defaultValues as never}
      values={defaultValues as never}
      onSubmit={onSubmit}
    >
      <FormInput name="email" label={tAuth('emailLabel')} type="email" autoComplete="email" />
      <FormInput
        name="password"
        type="password"
        label={isEdit ? tAuth('newPasswordLabel') : tAuth('passwordLabel')}
        description={isEdit ? tUsers('passwordHint') : undefined}
        autoComplete="new-password"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput name="firstName" label={tAuth('firstNameLabel')} autoComplete="given-name" />
        <FormInput name="lastName" label={tAuth('lastNameLabel')} autoComplete="family-name" />
      </div>
      <FormInput name="phone" label={tAuth('phoneLabel')} autoComplete="tel" />
      <FormMultiSelect
        name="roleIds"
        label={tUsers('rolesLabel')}
        options={roles.map((role) => ({
          value: role.id,
          label: role.name,
          description: role.description ?? undefined,
        }))}
        emptyText={rolesLoading ? tUsers('loadingRoles') : tUsers('noRolesAvailable')}
        disabled={rolesLoading}
      />
      {rolesLoading && <Spinner size={14} label={tCommon('loading')} />}
      <FormSelect
        name="status"
        label={tCommon('status')}
        options={[
          { value: UserStatus.ACTIVE, label: tStatus('active') },
          { value: UserStatus.INACTIVE, label: tStatus('inactive') },
          { value: UserStatus.SUSPENDED, label: tStatus('suspended') },
        ]}
      />
      <SubmitButton className="w-full">
        {isEdit ? tCommon('update') : tCommon('create')}
      </SubmitButton>
    </Form>
  );
}
