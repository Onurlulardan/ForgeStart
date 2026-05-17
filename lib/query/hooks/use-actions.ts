'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { actionsApi, type ActionInput, type ListParams } from '@/lib/api/client';

export function useActions(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.actions.list(params),
    queryFn: () => actionsApi.list(params),
  });
}

export function useActionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.actions.all });

  return {
    create: useMutation({
      mutationFn: (data: ActionInput) => actionsApi.create(data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: ActionInput }) =>
        actionsApi.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => actionsApi.remove(id),
      onSuccess: invalidate,
    }),
  };
}
