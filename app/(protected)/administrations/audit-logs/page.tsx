'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataGrid } from '@/components/data-grid';
import { PageShell } from '@/components/layout';
import { useAuditLogs } from '@/lib/query';
import { formatDate, truncate } from '@/lib/formatters';
import type { AuditLogListItem } from '@/lib/api/client';

export default function AuditLogsPage() {
  const t = useTranslations('admin.auditLogs');
  const { data: logs = [], isLoading } = useAuditLogs();

  const columns = useMemo<ColumnDef<AuditLogListItem>[]>(
    () => [
      {
        id: 'createdAt',
        header: t('columns.createdAt'),
        cell: ({ row }) => formatDate(row.original.createdAt, 'PPpp'),
      },
      {
        id: 'actor',
        header: t('columns.actor'),
        cell: ({ row }) => row.original.actorEmail ?? 'system',
      },
      {
        id: 'action',
        header: t('columns.action'),
        accessorKey: 'action',
        cell: ({ row }) => <span className="font-medium">{row.original.action}</span>,
      },
      {
        id: 'resource',
        header: t('columns.resource'),
        cell: ({ row }) => (
          <Badge variant="outline" className="rounded-md">
            {row.original.resource}
          </Badge>
        ),
      },
      {
        id: 'status',
        header: t('columns.status'),
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'SUCCESS' ? 'secondary' : 'destructive'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'message',
        header: t('columns.message'),
        cell: ({ row }) => (
          <span className="max-w-md truncate">{truncate(row.original.message, 120)}</span>
        ),
      },
      {
        id: 'ip',
        header: t('columns.ip'),
        accessorKey: 'ipAddress',
      },
    ],
    [t]
  );

  return (
    <PageShell title={t('title')} description={t('description')}>
      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<AuditLogListItem>
            data={logs}
            columns={columns}
            loading={isLoading}
            columnVisibilityStorageKey="admin-audit-logs"
            exportFileName="audit-logs"
            initialPageSize={20}
            toolbar={{ search: true, columnVisibility: true, exportable: true }}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
