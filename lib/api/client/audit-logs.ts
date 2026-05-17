import { getRequest } from '@/lib/apiClient';
import type { AuditLogListItem, ListParams } from './types';

const BASE = '/administrations/audit-logs';

export const auditLogsApi = {
  list: (params?: ListParams) => getRequest<AuditLogListItem[]>(BASE, { params }),
};
