'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { resourcesApi, type ListParams, type ResourceInput } from '@/lib/api/client';

export function useResources(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.resources.list(params),
    queryFn: () => resourcesApi.list(params),
  });
}

export function useResourceMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.resources.all });

  return {
    create: useMutation({
      mutationFn: (data: ResourceInput) => resourcesApi.create(data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: ResourceInput }) =>
        resourcesApi.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => resourcesApi.remove(id),
      onSuccess: invalidate,
    }),
  };
}
