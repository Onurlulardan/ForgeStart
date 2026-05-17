'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { auditLogsApi, type ListParams } from '@/lib/api/client';

export function useAuditLogs(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: () => auditLogsApi.list(params),
  });
}
