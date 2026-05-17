'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { rolesApi, type ListParams, type RoleInput } from '@/lib/api/client';

export function useRoles(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.roles.list(params),
    queryFn: () => rolesApi.list(params),
  });
}

export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.roles.detail(id) : ['roles', 'detail', 'idle'],
    queryFn: () => rolesApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useRoleMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.roles.all });

  return {
    create: useMutation({
      mutationFn: (data: RoleInput) => rolesApi.create(data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: RoleInput }) => rolesApi.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => rolesApi.remove(id),
      onSuccess: invalidate,
    }),
  };
}
