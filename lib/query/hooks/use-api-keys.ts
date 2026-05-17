'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { apiKeysApi, type ApiKeyCreateInput, type ListParams } from '@/lib/api/client';

export function useApiKeys(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.apiKeys.list(params),
    queryFn: () => apiKeysApi.list(params),
  });
}

export function useApiKeyMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.apiKeys.all });

  return {
    create: useMutation({
      mutationFn: (data: ApiKeyCreateInput) => apiKeysApi.create(data),
      onSuccess: invalidate,
    }),
    revoke: useMutation({
      mutationFn: (id: string) => apiKeysApi.revoke(id),
      onSuccess: invalidate,
    }),
  };
}
