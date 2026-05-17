'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { securityLogsApi, type ListParams } from '@/lib/api/client';

export function useSecurityLogs(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.securityLogs.list(params),
    queryFn: () => securityLogsApi.list(params),
  });
}
