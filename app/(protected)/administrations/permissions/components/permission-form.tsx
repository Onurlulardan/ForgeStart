'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormMultiSelect,
  FormSelect,
  SubmitButton,
} from '@/components/forms';
import { permissionSchema } from '@/lib/validation/admin';
import {
  useActions,
  useOrganizations,
  useResources,
  useRoles,
  useUsers,
} from '@/lib/query';
import { PermissionTarget } from '@/db/types';
import type { PermissionInput, PermissionWithRelations } from '@/lib/api/client';

export interface PermissionFormProps {
  initialValues?: PermissionWithRelations | null;
  onSubmit: (values: PermissionInput) => Promise<void>;
}

function TargetSelector() {
  const tPerm = useTranslations('admin.permissions.fields');
  const target = useWatch<PermissionInput>({ name: 'target' });

  const { data: users = [] } = useUsers();
  const { data: roles = [] } = useRoles();
  const { data: organizations = [] } = useOrganizations();

  if (target === PermissionTarget.USER) {
    return (
      <FormSelect
        name="userId"
        label={tPerm('user')}
        options={users.map((user) => ({
          value: user.id,
          label: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
        }))}
      />
    );
  }
  if (target === PermissionTarget.ROLE) {
    return (
      <FormSelect
        name="roleId"
        label={tPerm('role')}
        options={roles.map((role) => ({
          value: role.id,
          label: role.name,
        }))}
      />
    );
  }
  if (target === PermissionTarget.ORGANIZATION) {
    return (
      <FormSelect
        name="organizationId"
        label={tPerm('organization')}
        options={organizations.map((organization) => ({
          value: organization.id,
          label: organization.name,
        }))}
      />
    );
  }
  return null;
}

export function PermissionForm({ initialValues, onSubmit }: PermissionFormProps) {
  const tCommon = useTranslations('common');
  const tPerm = useTranslations('admin.permissions.fields');
  const { data: resources = [] } = useResources();
  const { data: actions = [] } = useActions();
  const schema = permissionSchema as unknown as z.ZodType<PermissionInput>;

  const defaultValues = useMemo<PermissionInput>(
    () => ({
      resourceId: initialValues?.resourceId ?? '',
      target: initialValues?.target ?? PermissionTarget.ROLE,
      userId: initialValues?.user?.id ?? null,
      roleId: initialValues?.role?.id ?? null,
      organizationId: initialValues?.organization?.id ?? null,
      actionIds: initialValues?.actions?.map((permissionAction) => permissionAction.action.id) ?? [],
    }),
    [initialValues]
  );

  return (
    <Form<PermissionInput>
      schema={schema}
      defaultValues={defaultValues as never}
      values={defaultValues as never}
      onSubmit={onSubmit}
    >
      <FormSelect
        name="resourceId"
        label={tPerm('resource')}
        options={resources.map((resource) => ({
          value: resource.id,
          label: `${resource.name} (${resource.slug})`,
        }))}
      />
      <FormSelect
        name="target"
        label={tPerm('target')}
        options={[
          { value: PermissionTarget.USER, label: tPerm('user') },
          { value: PermissionTarget.ROLE, label: tPerm('role') },
          { value: PermissionTarget.ORGANIZATION, label: tPerm('organization') },
        ]}
      />
      <TargetSelector />
      <FormMultiSelect
        name="actionIds"
        label={tPerm('actions')}
        options={actions.map((action) => ({
          value: action.id,
          label: action.name,
          description: action.slug,
        }))}
      />
      <SubmitButton className="w-full">
        {initialValues ? tCommon('update') : tCommon('create')}
      </SubmitButton>
    </Form>
  );
}
