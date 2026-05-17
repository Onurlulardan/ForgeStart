'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  usersApi,
  type CreateUserInput,
  type ListParams,
  type UpdateUserInput,
} from '@/lib/api/client';

export function useUsers(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.list(params),
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.users.detail(id) : ['users', 'detail', 'idle'],
    queryFn: () => usersApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useAvailableUsers() {
  return useQuery({
    queryKey: queryKeys.users.available(),
    queryFn: () => usersApi.available(),
  });
}

export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.users.all });

  return {
    create: useMutation({
      mutationFn: (data: CreateUserInput) => usersApi.create(data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
        usersApi.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => usersApi.remove(id),
      onSuccess: invalidate,
    }),
  };
}
