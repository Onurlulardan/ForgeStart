'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { appSettingsApi, type SettingsUpdateInput } from '@/lib/api/client';

export function useAppSettings(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.appSettings.all,
    queryFn: () => appSettingsApi.list(),
    enabled: options.enabled ?? true,
  });
}

export function useAppSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SettingsUpdateInput) => appSettingsApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appSettings.all }),
  });
}
