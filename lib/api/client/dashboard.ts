import { getRequest } from '@/lib/apiClient';
import type { DashboardStats, HealthStatus, VersionInfo } from './types';

export const dashboardApi = {
  stats: () => getRequest<DashboardStats>('/dashboard/stats'),
  health: () => getRequest<HealthStatus>('/health'),
  version: () => getRequest<VersionInfo>('/version'),
};
