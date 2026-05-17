'use client';

import type { Table } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BulkAction } from '../types';

interface BulkActionBarProps<TData> {
  table: Table<TData>;
  actions: BulkAction<TData>[];
}

export function BulkActionBar<TData>({ table, actions }: BulkActionBarProps<TData>) {
  const t = useTranslations('dataGrid');
  const tCommon = useTranslations('common');
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const count = selectedRows.length;

  if (count === 0) return null;

  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border bg-muted/40 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm">
        <span className="font-medium text-foreground">{t('rowsSelected', { count })}</span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => table.resetRowSelection()}
        >
          <XIcon />
          {tCommon('deselectAll')}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            type="button"
            size="sm"
            variant={action.destructive ? 'destructive' : 'outline'}
            disabled={action.disabled}
            onClick={() => action.onSelect(selectedRows)}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
