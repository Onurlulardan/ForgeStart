import { getRequest } from '@/lib/apiClient';
import type { SecurityLogListItem, ListParams } from './types';

const BASE = '/administrations/security-logs';

export const securityLogsApi = {
  list: (params?: ListParams) => getRequest<SecurityLogListItem[]>(BASE, { params }),
};
