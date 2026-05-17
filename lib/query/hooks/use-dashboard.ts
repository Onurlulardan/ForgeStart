'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { dashboardApi } from '@/lib/api/client';

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => dashboardApi.stats(),
  });
}

export function useHealthStatus() {
  return useQuery({
    queryKey: queryKeys.dashboard.health(),
    queryFn: () => dashboardApi.health(),
    refetchInterval: 60_000,
  });
}

export function useVersionInfo() {
  return useQuery({
    queryKey: queryKeys.dashboard.version(),
    queryFn: () => dashboardApi.version(),
  });
}
