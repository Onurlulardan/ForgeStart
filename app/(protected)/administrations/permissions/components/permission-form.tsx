'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Permission, Resource, Action, PermissionTarget } from '@/db/types';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { MultiSelectList } from '@/components/app/multi-select-list';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getRequest } from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface Role {
  id: string;
  name: string;
  organizationId: string | null;
}

interface Organization {
  id: string;
  name: string;
}

interface PermissionWithRelations extends Permission {
  resource: Resource;
  actions: {
    action: Action;
  }[];
  user?: User | null;
  role?: Role | null;
  organization?: Organization | null;
}

export interface PermissionFormData {
  resourceId: string;
  target: PermissionTarget;
  userId: string | null;
  roleId: string | null;
  organizationId: string | null;
  actionIds: string[];
}

interface PermissionFormProps {
  initialValues?: PermissionWithRelations | null;
  onSubmit: (values: PermissionFormData) => Promise<void>;
  loading?: boolean;
}

const emptyForm: PermissionFormData = {
  resourceId: '',
  target: PermissionTarget.ROLE,
  userId: null,
  roleId: null,
  organizationId: null,
  actionIds: [],
};

export function PermissionForm({ initialValues, onSubmit, loading }: PermissionFormProps) {
  const [values, setValues] = useState<PermissionFormData>(emptyForm);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<{
    resources: Resource[];
    actions: Action[];
    users: User[];
    roles: Role[];
    organizations: Organization[];
  }>({
    resources: [],
    actions: [],
    users: [],
    roles: [],
    organizations: [],
  });

  useEffect(() => {
    const fetchFormData = async () => {
      setLoadingData(true);
      try {
        const [resources, actions, users, roles, organizations] = await Promise.all([
          getRequest<Resource[]>('/administrations/resources'),
          getRequest<Action[]>('/administrations/actions'),
          getRequest<User[]>('/administrations/users'),
          getRequest<Role[]>('/administrations/roles'),
          getRequest<Organization[]>('/administrations/organizations'),
        ]);

        setFormData({ resources, actions, users, roles, organizations });
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchFormData();
  }, []);

  useEffect(() => {
    if (!initialValues) {
      setValues(emptyForm);
      return;
    }

    setValues({
      resourceId: initialValues.resourceId,
      target: initialValues.target,
      userId: initialValues.user?.id ?? null,
      roleId: initialValues.role?.id ?? null,
      organizationId: initialValues.organization?.id ?? null,
      actionIds: initialValues.actions?.map((permissionAction) => permissionAction.action.id) ?? [],
    });
  }, [initialValues]);

  const updateTarget = (target: PermissionTarget) => {
    setValues((current) => ({
      ...current,
      target,
      userId: null,
      roleId: null,
      organizationId: null,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel>Resource</FieldLabel>
          <Select
            value={values.resourceId}
            onValueChange={(resourceId) =>
              setValues((current) => ({ ...current, resourceId: String(resourceId) }))
            }
            disabled={loadingData}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {formData.resources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name} ({resource.slug})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Target type</FieldLabel>
          <Select
            value={values.target}
            onValueChange={(target) => updateTarget(target as PermissionTarget)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select target type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={PermissionTarget.USER}>User</SelectItem>
                <SelectItem value={PermissionTarget.ROLE}>Role</SelectItem>
                <SelectItem value={PermissionTarget.ORGANIZATION}>Organization</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {values.target === PermissionTarget.USER && (
          <Field>
            <FieldLabel>User</FieldLabel>
            <Select
              value={values.userId ?? ''}
              onValueChange={(userId) => setValues((current) => ({ ...current, userId }))}
              disabled={loadingData}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {formData.users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}

        {values.target === PermissionTarget.ROLE && (
          <Field>
            <FieldLabel>Role</FieldLabel>
            <Select
              value={values.roleId ?? ''}
              onValueChange={(roleId) => setValues((current) => ({ ...current, roleId }))}
              disabled={loadingData}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {formData.roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                      {role.organizationId ? ' (Organization)' : ' (Global)'}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}

        {values.target === PermissionTarget.ORGANIZATION && (
          <Field>
            <FieldLabel>Organization</FieldLabel>
            <Select
              value={values.organizationId ?? ''}
              onValueChange={(organizationId) =>
                setValues((current) => ({ ...current, organizationId }))
              }
              disabled={loadingData}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {formData.organizations.map((organization) => (
                    <SelectItem key={organization.id} value={organization.id}>
                      {organization.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}

        <Field>
          <FieldLabel>Actions</FieldLabel>
          <MultiSelectList
            value={values.actionIds}
            disabled={loadingData}
            emptyText={loadingData ? 'Loading actions...' : 'No actions available.'}
            options={formData.actions.map((action) => ({
              value: action.id,
              label: action.name,
              description: action.slug,
            }))}
            onChange={(actionIds) => setValues((current) => ({ ...current, actionIds }))}
          />
        </Field>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || loadingData || !values.resourceId || values.actionIds.length === 0}
        >
          {loading ? 'Saving...' : initialValues ? 'Update permission' : 'Create permission'}
        </Button>
      </FieldGroup>
    </form>
  );
}
