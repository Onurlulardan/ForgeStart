'use client';

import type { Table } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataGridPaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions: number[];
  totalCount?: number;
}

export function DataGridPagination<TData>({
  table,
  pageSizeOptions,
  totalCount,
}: DataGridPaginationProps<TData>) {
  const t = useTranslations('dataGrid');
  const state = table.getState().pagination;
  const pageCount = table.getPageCount() || 1;
  const currentTotal = totalCount ?? table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>{t('totalRecords', { count: currentTotal })}</span>
      <div className="flex items-center gap-2">
        <select
          className="h-8 rounded-lg border bg-background px-2 text-sm text-foreground"
          value={state.pageSize}
          onChange={(event) => table.setPageSize(Number(event.target.value))}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {t('perPage', { size: option })}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </Button>
        <span className="min-w-24 text-center text-xs">
          {t('page', { page: state.pageIndex + 1, total: pageCount })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
