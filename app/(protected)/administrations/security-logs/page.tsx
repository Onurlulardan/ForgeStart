'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { DataGrid } from '@/core/components/datagrid';
import { getRequest } from '@/lib/apiClient';
import { usePermission } from '@/lib/auth/client-permissions';

interface SecurityLog {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  status: string;
  type: string;
  message: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const canViewLogs = usePermission('security-log', 'view');

  useEffect(() => {
    const fetchLogs = async () => {
      if (!canViewLogs) return;
      setLoading(true);
      try {
        const data = await getRequest<SecurityLog[]>('/administrations/security-logs');
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch security logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [canViewLogs]);

  if (!canViewLogs) {
    return null;
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: 'Identity',
      key: 'identity',
      render: (record: SecurityLog) => (
        <div>
          <div className="font-medium">{record.email || '-'}</div>
          <div className="text-xs text-muted-foreground">
            {record.user ? `${record.user.firstName} ${record.user.lastName}` : 'No linked user'}
          </div>
        </div>
      ),
    },
    { title: 'IP address', dataIndex: 'ipAddress', key: 'ipAddress' },
    {
      title: 'Message',
      key: 'message',
      render: (record: SecurityLog) => (
        <div className="max-w-sm">
          <div className="truncate">{record.message}</div>
          <div className="truncate text-xs text-muted-foreground">{record.userAgent}</div>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Security logs"
        description="Review authentication attempts, status, IP address and browser context."
      />
      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<SecurityLog>
            columns={columns}
            dataSource={logs}
            loading={loading}
            rowKey="id"
            storageKey="admin-security-logs"
            pageSize={20}
          />
        </CardContent>
      </Card>
    </>
  );
}
