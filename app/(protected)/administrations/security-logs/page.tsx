'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { DataGrid } from '@/components/data-grid';
import { PageShell } from '@/components/layout';
import { StatusBadge } from '@/components/app/status-badge';
import { useSecurityLogs } from '@/lib/query';
import { formatDate, truncate } from '@/lib/formatters';
import type { SecurityLogListItem } from '@/lib/api/client';

export default function SecurityLogsPage() {
  const t = useTranslations('admin.securityLogs');
  const { data: logs = [], isLoading } = useSecurityLogs();

  const columns = useMemo<ColumnDef<SecurityLogListItem>[]>(
    () => [
      {
        id: 'createdAt',
        header: t('columns.createdAt'),
        cell: ({ row }) => formatDate(row.original.createdAt, 'PPpp'),
      },
      {
        id: 'email',
        header: t('columns.email'),
        accessorKey: 'email',
        cell: ({ row }) => <span className="font-medium">{row.original.email || '—'}</span>,
      },
      {
        id: 'type',
        header: t('columns.type'),
        accessorKey: 'type',
      },
      {
        id: 'status',
        header: t('columns.status'),
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'message',
        header: t('columns.message'),
        cell: ({ row }) => (
          <span className="block max-w-sm truncate">{truncate(row.original.message, 120)}</span>
        ),
      },
      {
        id: 'ip',
        header: t('columns.ip'),
        accessorKey: 'ipAddress',
      },
      {
        id: 'userAgent',
        header: t('columns.userAgent'),
        cell: ({ row }) => truncate(row.original.userAgent, 60),
      },
    ],
    [t]
  );

  return (
    <PageShell title={t('title')} description={t('description')}>
      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<SecurityLogListItem>
            data={logs}
            columns={columns}
            loading={isLoading}
            columnVisibilityStorageKey="admin-security-logs"
            exportFileName="security-logs"
            initialPageSize={20}
            toolbar={{ search: true, columnVisibility: true, exportable: true }}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
