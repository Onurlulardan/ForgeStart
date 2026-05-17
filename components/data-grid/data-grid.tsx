/* eslint-disable react-hooks/incompatible-library -- TanStack Table is intentionally stateful; keep the opt-out local to DataGrid. */
'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { useLocalStorage } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { actionsColumn } from './columns/actions-column';
import { selectColumn } from './columns/select-column';
import { useGridExport } from './hooks/use-grid-export';
import { BulkActionBar } from './toolbar/bulk-action-bar';
import { DataGridToolbar } from './toolbar/data-grid-toolbar';
import { DataGridPagination } from './pagination/data-grid-pagination';
import type {
  BulkAction,
  DataGridPaginationState,
  DataGridServerState,
  DataGridToolbarConfig,
  RowAction,
} from './types';

export interface DataGridServerSide {
  totalCount: number;
  onStateChange: (state: DataGridServerState) => void;
  state?: DataGridServerState;
}

export interface DataGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  loading?: boolean;
  emptyState?: ReactNode;
  rowKey?: keyof TData | ((row: TData) => string);
  toolbar?: DataGridToolbarConfig;
  bulkActions?: BulkAction<TData>[];
  rowActions?: (row: TData) => RowAction<TData>[];
  enableRowSelection?: boolean;
  initialSorting?: SortingState;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  columnVisibilityStorageKey?: string;
  exportFileName?: string;
  onRowDoubleClick?: (row: TData) => void;
  serverSide?: DataGridServerSide;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  getSubRows?: (row: TData) => TData[] | undefined;
  defaultExpandAll?: boolean;
  className?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function defaultRowKey<TData>(row: TData): string | number {
  if (row && typeof row === 'object' && 'id' in row) {
    const id = (row as Record<string, unknown>).id;
    if (typeof id === 'string' || typeof id === 'number') return id;
  }
  return JSON.stringify(row);
}

export function DataGrid<TData>({
  data,
  columns: userColumns,
  loading = false,
  emptyState,
  rowKey,
  toolbar,
  bulkActions,
  rowActions,
  enableRowSelection,
  initialSorting,
  initialPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  columnVisibilityStorageKey,
  exportFileName = 'data-grid',
  onRowDoubleClick,
  serverSide,
  getRowCanExpand,
  getSubRows,
  defaultExpandAll = false,
  className,
}: DataGridProps<TData>) {
  'use no memo';

  const t = useTranslations('dataGrid');

  const columns = useMemo<ColumnDef<TData>[]>(() => {
    const composed: ColumnDef<TData>[] = [];
    if (enableRowSelection || (bulkActions && bulkActions.length > 0)) {
      composed.push(selectColumn<TData>());
    }
    composed.push(...userColumns);
    if (rowActions) {
      composed.push(actionsColumn<TData>(rowActions));
    }
    return composed;
  }, [bulkActions, enableRowSelection, rowActions, userColumns]);

  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<DataGridPaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [expanded, setExpanded] = useState<ExpandedState>(defaultExpandAll ? true : {});

  const [persistedVisibility, setPersistedVisibility] = useLocalStorage<VisibilityState>(
    columnVisibilityStorageKey ? `dg:${columnVisibilityStorageKey}:cols` : '__dg_noop__',
    {}
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    columnVisibilityStorageKey ? persistedVisibility : {}
  );

  useEffect(() => {
    if (columnVisibilityStorageKey) {
      setPersistedVisibility(columnVisibility);
    }
  }, [columnVisibility, columnVisibilityStorageKey, setPersistedVisibility]);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (serverSide) serverSide.onStateChange({ ...serverSide.state, sorting: next });
      return next;
    });
  };

  const handlePaginationChange: OnChangeFn<DataGridPaginationState> = (updater) => {
    setPagination((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (serverSide) serverSide.onStateChange({ ...serverSide.state, pagination: next });
      return next;
    });
  };

  const handleGlobalFilterChange: OnChangeFn<string> = (updater) => {
    setGlobalFilter((prev) => {
      const next = typeof updater === 'function' ? updater(prev as string) : (updater as string);
      if (serverSide) serverSide.onStateChange({ ...serverSide.state, globalFilter: next });
      return next;
    });
  };

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      pagination,
      columnVisibility,
      expanded,
    },
    getRowId: rowKey
      ? typeof rowKey === 'function'
        ? (row) => rowKey(row)
        : (row) => String((row as Record<string, unknown>)[rowKey as string])
      : (row) => String(defaultRowKey(row)),
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    manualPagination: Boolean(serverSide),
    manualSorting: Boolean(serverSide),
    manualFiltering: Boolean(serverSide),
    pageCount: serverSide
      ? Math.max(1, Math.ceil(serverSide.totalCount / pagination.pageSize))
      : undefined,
    rowCount: serverSide?.totalCount,
    enableRowSelection,
    enableExpanding: Boolean(getSubRows || getRowCanExpand),
    getSubRows,
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: serverSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    getPaginationRowModel: serverSide ? undefined : getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const { exportCsv, exportXlsx } = useGridExport({ table, fileName: exportFileName });

  const showToolbar =
    toolbar &&
    (toolbar.search || toolbar.columnVisibility || toolbar.exportable || toolbar.extra);

  const rows = table.getRowModel().rows;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {showToolbar && (
        <DataGridToolbar
          table={table}
          search={toolbar.search}
          searchPlaceholder={toolbar.searchPlaceholder}
          columnVisibility={toolbar.columnVisibility}
          exportable={toolbar.exportable}
          onExportCsv={exportCsv}
          onExportXlsx={exportXlsx}
          extra={toolbar.extra}
        />
      )}
      {bulkActions && bulkActions.length > 0 && <BulkActionBar table={table} actions={bulkActions} />}
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(pagination.pageSize, 5) }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-5 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-40 p-0"
                >
                  {emptyState ?? <EmptyState title={t('noRecords')} className="border-0 bg-transparent" />}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className={cn(onRowDoubleClick && 'cursor-pointer')}
                  onDoubleClick={() => onRowDoubleClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell, columnIndex) => (
                    <TableCell
                      key={cell.id}
                      style={
                        columnIndex === 0 && row.depth > 0
                          ? { paddingLeft: `${row.depth * 1.25 + 0.5}rem` }
                          : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <DataGridPagination
        table={table}
        pageSizeOptions={pageSizeOptions}
        totalCount={serverSide?.totalCount}
      />
    </div>
  );
}
