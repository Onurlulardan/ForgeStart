'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  permissionsApi,
  rbacMatrixApi,
  type ListParams,
  type PermissionInput,
  type RbacMatrixUpdateInput,
} from '@/lib/api/client';

export function usePermissions(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.permissions.list(params),
    queryFn: () => permissionsApi.list(params),
  });
}

export function usePermissionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.permissions.all });

  return {
    create: useMutation({
      mutationFn: (data: PermissionInput) => permissionsApi.create(data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: PermissionInput }) =>
        permissionsApi.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => permissionsApi.remove(id),
      onSuccess: invalidate,
    }),
  };
}

export function useRbacMatrix() {
  return useQuery({
    queryKey: queryKeys.rbacMatrix.all,
    queryFn: () => rbacMatrixApi.get(),
  });
}

export function useRbacMatrixMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RbacMatrixUpdateInput) => rbacMatrixApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.rbacMatrix.all }),
  });
}
