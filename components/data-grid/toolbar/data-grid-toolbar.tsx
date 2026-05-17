'use client';

import { type ReactNode } from 'react';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { ColumnVisibility } from './column-visibility';
import { ExportButton } from './export-button';

interface DataGridToolbarProps<TData> {
  table: Table<TData>;
  search?: boolean;
  searchPlaceholder?: string;
  columnVisibility?: boolean;
  exportable?: boolean;
  onExportCsv?: () => void;
  onExportXlsx?: () => void;
  extra?: ReactNode;
}

export function DataGridToolbar<TData>({
  table,
  search,
  searchPlaceholder,
  columnVisibility,
  exportable,
  onExportCsv,
  onExportXlsx,
  extra,
}: DataGridToolbarProps<TData>) {
  const t = useTranslations('dataGrid');
  const showAnything =
    search ||
    columnVisibility ||
    (exportable && onExportCsv && onExportXlsx) ||
    extra;

  if (!showAnything) return null;

  const globalFilter = (table.getState().globalFilter as string | undefined) ?? '';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {search ? (
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={globalFilter}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder ?? t('search')}
          />
        </div>
      ) : (
        <div />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {extra}
        {columnVisibility && <ColumnVisibility table={table} />}
        {exportable && onExportCsv && onExportXlsx && (
          <ExportButton onExportCsv={onExportCsv} onExportXlsx={onExportXlsx} />
        )}
      </div>
    </div>
  );
}
