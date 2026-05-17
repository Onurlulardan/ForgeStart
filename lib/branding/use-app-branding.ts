'use client';

import { useMemo } from 'react';
import { useAppSettings } from '@/lib/query';
import { resolveAppBranding } from './constants';

export function useAppBranding(options: { enabled?: boolean } = {}) {
  const query = useAppSettings({ enabled: options.enabled });
  const branding = useMemo(() => resolveAppBranding(query.data), [query.data]);

  return {
    ...query,
    branding,
  };
}
