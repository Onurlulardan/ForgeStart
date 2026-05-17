'use client';

import { FormEvent, useEffect, useState } from 'react';
import { User, UserStatus } from '@/db/types';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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

export type UserFormData = Omit<
  User,
  'id' | 'name' | 'image' | 'passwordHash' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'avatar'
> & {
  password?: string;
  roleIds?: string[];
};

interface UserRole {
  role: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface UserWithRoles extends Partial<UserFormData> {
  userRoles?: UserRole[];
}

interface UserFormProps {
  initialValues?: UserWithRoles;
  onSubmit: (values: UserFormData) => Promise<void>;
  loading: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

const emptyForm: UserFormData = {
  email: '',
  password: '',
  firstName: null,
  lastName: null,
  phone: null,
  status: UserStatus.ACTIVE,
  roleIds: [],
};

export function UserForm({ initialValues, onSubmit, loading }: UserFormProps) {
  const [values, setValues] = useState<UserFormData>(emptyForm);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    const roleIds = initialValues?.userRoles?.map((userRole) => userRole.role.id) ?? [];
    setValues({
      ...emptyForm,
      ...initialValues,
      password: '',
      roleIds,
    });
  }, [initialValues]);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const data = await getRequest<Role[]>('/administrations/roles');
        setRoles(data);

        if (!initialValues) {
          const defaultRole = data.find((role) => role.isDefault);
          if (defaultRole) {
            setValues((current) => ({ ...current, roleIds: [defaultRole.id] }));
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [initialValues]);

  const updateValue = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(event) => updateValue('email', event.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">{initialValues ? 'New password' : 'Password'}</FieldLabel>
          <Input
            id="password"
            type="password"
            value={values.password ?? ''}
            onChange={(event) => updateValue('password', event.target.value)}
            required={!initialValues}
            minLength={initialValues ? undefined : 8}
          />
          {initialValues && (
            <FieldDescription>Leave blank to keep the current password.</FieldDescription>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input
              id="firstName"
              value={values.firstName ?? ''}
              onChange={(event) => updateValue('firstName', event.target.value || null)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input
              id="lastName"
              value={values.lastName ?? ''}
              onChange={(event) => updateValue('lastName', event.target.value || null)}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input
            id="phone"
            value={values.phone ?? ''}
            onChange={(event) => updateValue('phone', event.target.value || null)}
          />
        </Field>

        <Field>
          <FieldLabel>Roles</FieldLabel>
          <MultiSelectList
            value={values.roleIds ?? []}
            disabled={loadingRoles}
            emptyText={loadingRoles ? 'Loading roles...' : 'No roles available.'}
            options={roles.map((role) => ({
              value: role.id,
              label: role.name,
              description: role.description ?? undefined,
            }))}
            onChange={(roleIds) => updateValue('roleIds', roleIds)}
          />
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select
            value={values.status}
            onValueChange={(status) => updateValue('status', status as UserStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.values(UserStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : initialValues ? 'Update user' : 'Create user'}
        </Button>
      </FieldGroup>
    </form>
  );
}
