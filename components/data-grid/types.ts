import type { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/react-table';
import type { ReactNode } from 'react';

export type DataGridColumn<TData, TValue = unknown> = ColumnDef<TData, TValue>;

export interface BulkAction<TData> {
  label: ReactNode;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onSelect: (rows: TData[]) => void | Promise<void>;
}

export interface RowAction<TData> {
  label: ReactNode;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: (row: TData) => boolean;
  onSelect: (row: TData) => void | Promise<void>;
}

export interface DataGridPaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface DataGridServerState {
  pagination?: DataGridPaginationState;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  globalFilter?: string;
}

export interface DataGridToolbarConfig {
  search?: boolean;
  searchPlaceholder?: string;
  columnVisibility?: boolean;
  exportable?: boolean;
  extra?: ReactNode;
}

export type DataGridMode = 'client' | 'server';
