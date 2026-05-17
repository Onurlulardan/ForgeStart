'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Organization, OrgStatus } from '@/db/types';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getRequest } from '@/lib/apiClient';

export interface OrganizationFormData {
  name: string;
  slug: string;
  status: OrgStatus;
  parentId: string | null;
}

interface OrganizationFormProps {
  initialValues?: Organization;
  onSubmit: (values: OrganizationFormData) => Promise<void> | void;
  loading?: boolean;
}

const emptyForm: OrganizationFormData = {
  name: '',
  slug: '',
  status: OrgStatus.ACTIVE,
  parentId: null,
};

export function OrganizationForm({ initialValues, onSubmit, loading }: OrganizationFormProps) {
  const [values, setValues] = useState<OrganizationFormData>(emptyForm);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const fetchAvailableParents = async () => {
      try {
        const url = initialValues
          ? `/administrations/organizations/available-parents?organizationId=${initialValues.id}`
          : '/administrations/organizations/available-parents';

        const data = await getRequest<Organization[]>(url);
        setOrganizations(data);
      } catch (error) {
        console.error('Failed to fetch available parents:', error);
      }
    };

    fetchAvailableParents();
  }, [initialValues]);

  useEffect(() => {
    setValues({
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      status: initialValues?.status ?? OrgStatus.ACTIVE,
      parentId: initialValues?.parentId ?? null,
    });
  }, [initialValues]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="organizationName">Name</FieldLabel>
          <Input
            id="organizationName"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="organizationSlug">Slug</FieldLabel>
          <Input
            id="organizationSlug"
            pattern="^[a-z0-9-]+$"
            value={values.slug}
            onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))}
            required
          />
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select
            value={values.status}
            onValueChange={(status) =>
              setValues((current) => ({ ...current, status: status as OrgStatus }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.values(OrgStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Parent organization</FieldLabel>
          <Select
            value={values.parentId ?? 'root'}
            onValueChange={(value) =>
              setValues((current) => ({ ...current, parentId: value === 'root' ? null : value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select parent organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="root">No parent</SelectItem>
                {organizations.map((organization) => (
                  <SelectItem key={organization.id} value={organization.id}>
                    {organization.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : initialValues ? 'Update organization' : 'Create organization'}
        </Button>
      </FieldGroup>
    </form>
  );
}
