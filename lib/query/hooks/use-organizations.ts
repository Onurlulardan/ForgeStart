'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  organizationsApi,
  type AddUsersToOrganizationInput,
  type ListParams,
  type OrganizationInput,
} from '@/lib/api/client';

export function useOrganizations(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.organizations.list(params),
    queryFn: () => organizationsApi.list(params),
  });
}

export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.organizations.detail(id) : ['organizations', 'detail', 'idle'],
    queryFn: () => organizationsApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useAvailableParents(organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.organizations.availableParents(organizationId),
    queryFn: () => organizationsApi.availableParents(organizationId),
  });
}

export function useOrganizationMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.organizations.all });

  return {
    create: useMutation({
      mutationFn: (data: OrganizationInput) => organizationsApi.create(data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: OrganizationInput }) =>
        organizationsApi.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => organizationsApi.remove(id),
      onSuccess: invalidate,
    }),
    addUsers: useMutation({
      mutationFn: ({ id, data }: { id: string; data: AddUsersToOrganizationInput }) =>
        organizationsApi.addUsers(id, data),
      onSuccess: invalidate,
    }),
  };
}
