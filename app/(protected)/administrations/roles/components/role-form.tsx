'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Role, Organization } from '@/db/types';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getRequest } from '@/lib/apiClient';

export interface RoleFormData {
  name: string;
  description: string | null;
  isDefault: boolean;
  organizationId: string | null;
}

interface RoleFormProps {
  initialValues?: Role | null;
  onSubmit: (values: RoleFormData) => Promise<void>;
  loading?: boolean;
}

const emptyForm: RoleFormData = {
  name: '',
  description: null,
  isDefault: false,
  organizationId: null,
};

export function RoleForm({ initialValues, onSubmit, loading }: RoleFormProps) {
  const [values, setValues] = useState<RoleFormData>(emptyForm);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  useEffect(() => {
    setValues({
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? null,
      isDefault: initialValues?.isDefault ?? false,
      organizationId: initialValues?.organizationId ?? null,
    });
  }, [initialValues]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoadingOrgs(true);
      try {
        const data = await getRequest<Organization[]>('/administrations/organizations');
        setOrganizations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="roleName">Role name</FieldLabel>
          <Input
            id="roleName"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            minLength={3}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="roleDescription">Description</FieldLabel>
          <Textarea
            id="roleDescription"
            rows={4}
            maxLength={500}
            value={values.description ?? ''}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value || null }))
            }
          />
        </Field>

        <Field>
          <FieldLabel>Organization</FieldLabel>
          <Select
            value={values.organizationId ?? 'global'}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                organizationId: value === 'global' ? null : value,
              }))
            }
            disabled={loadingOrgs}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="global">Global role</SelectItem>
                {organizations.map((organization) => (
                  <SelectItem key={organization.id} value={organization.id}>
                    {organization.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>Global roles apply across all organizations.</FieldDescription>
        </Field>

        <Field orientation="horizontal">
          <Switch
            checked={values.isDefault}
            onCheckedChange={(checked) =>
              setValues((current) => ({ ...current, isDefault: Boolean(checked) }))
            }
            aria-label="Default role"
          />
          <div>
            <FieldLabel>Default role</FieldLabel>
            <FieldDescription>Automatically assign this role to new members.</FieldDescription>
          </div>
        </Field>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setValues(emptyForm)}>
            Reset
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : initialValues ? 'Update role' : 'Create role'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
