'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Columns3Icon,
  DownloadIcon,
  SearchIcon,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DataGridColumn<T> {
  title: ReactNode;
  key?: string;
  dataIndex?: keyof T | string;
  width?: number | string;
  className?: string;
  render?: (...args: any[]) => ReactNode;
}

export interface DataGridProps<T> {
  columns: DataGridColumn<T>[];
  dataSource?: T[];
  loading?: boolean;
  pageSize?: number;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
  total?: number;
  rowKey?: keyof T | ((record: T) => string);
  headerContent?: ReactNode;
  storageKey?: string;
  enableToolbar?: boolean;
  onRowDoubleClick?: (record: T) => void;
  expandable?: {
    defaultExpandAllRows?: boolean;
    childrenColumnName?: string;
  };
}

function getValue<T>(record: T, dataIndex?: keyof T | string) {
  if (!dataIndex) return undefined;
  return String(dataIndex)
    .split('.')
    .reduce<unknown>((value, key) => {
      if (value && typeof value === 'object' && key in value) {
        return (value as Record<string, unknown>)[key];
      }
      return undefined;
    }, record as unknown);
}

function getRowKey<T>(record: T, rowKey: DataGridProps<T>['rowKey'], index: number) {
  if (typeof rowKey === 'function') return rowKey(record);
  if (rowKey && record && typeof record === 'object') {
    const value = (record as Record<string, unknown>)[String(rowKey)];
    if (typeof value === 'string' || typeof value === 'number') return String(value);
  }
  return String(index);
}

function flattenRows<T>(
  rows: T[],
  rowKey: DataGridProps<T>['rowKey'],
  childrenColumnName: string,
  expanded: Set<string>,
  level = 0
): Array<{ record: T; level: number; key: string; hasChildren: boolean }> {
  return rows.flatMap((record, index) => {
    const key = getRowKey(record, rowKey, index);
    const children = (record as Record<string, unknown>)[childrenColumnName];
    const childRows = Array.isArray(children) ? (children as T[]) : [];
    const current = { record, level, key, hasChildren: childRows.length > 0 };

    if (!childRows.length || !expanded.has(key)) {
      return [current];
    }

    return [current, ...flattenRows(childRows, rowKey, childrenColumnName, expanded, level + 1)];
  });
}

export function DataGrid<T extends object>({
  loading = false,
  pageSize = 10,
  pageSizeOptions = ['10', '20', '50', '100'],
  showSizeChanger = true,
  total,
  rowKey = 'id' as keyof T,
  headerContent,
  storageKey,
  enableToolbar = true,
  onRowDoubleClick,
  columns,
  dataSource = [],
  expandable,
}: DataGridProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [filterText, setFilterText] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const childrenColumnName = expandable?.childrenColumnName ?? 'children';
  const preferenceKey = storageKey ? `datagrid:${storageKey}` : null;

  const normalizedColumns = useMemo(
    () =>
      columns.map((column, index) => ({
        ...column,
        id: column.key ?? String(column.dataIndex ?? index),
      })),
    [columns]
  );

  const visibleColumns = useMemo(
    () => normalizedColumns.filter((column) => !hiddenColumns.has(column.id)),
    [hiddenColumns, normalizedColumns]
  );

  useEffect(() => {
    if (!preferenceKey || typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(preferenceKey);
    if (!raw) return;

    try {
      const preferences = JSON.parse(raw) as { filterText?: string; hiddenColumns?: string[] };
      setFilterText(preferences.filterText ?? '');
      setHiddenColumns(new Set(preferences.hiddenColumns ?? []));
    } catch {
      window.localStorage.removeItem(preferenceKey);
    }
  }, [preferenceKey]);

  useEffect(() => {
    if (!preferenceKey || typeof window === 'undefined') return;
    window.localStorage.setItem(
      preferenceKey,
      JSON.stringify({ filterText, hiddenColumns: [...hiddenColumns] })
    );
  }, [filterText, hiddenColumns, preferenceKey]);

  const defaultExpanded = useMemo(() => {
    if (!expandable?.defaultExpandAllRows) return new Set<string>();
    const keys = new Set<string>();
    const collect = (rows: T[]) => {
      rows.forEach((record, index) => {
        const key = getRowKey(record, rowKey, index);
        const children = (record as Record<string, unknown>)[childrenColumnName];
        if (Array.isArray(children) && children.length) {
          keys.add(key);
          collect(children as T[]);
        }
      });
    };
    collect(dataSource);
    return keys;
  }, [childrenColumnName, dataSource, expandable?.defaultExpandAllRows, rowKey]);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(defaultExpanded);

  useEffect(() => {
    if (expandable?.defaultExpandAllRows) {
      setExpandedRows(defaultExpanded);
    }
  }, [defaultExpanded, expandable?.defaultExpandAllRows]);

  const filteredRows = useMemo(() => {
    const flat = flattenRows(dataSource, rowKey, childrenColumnName, expandedRows);
    const normalizedFilter = filterText.trim().toLowerCase();
    if (!normalizedFilter) return flat;

    return flat.filter(({ record }) =>
      JSON.stringify(record).toLowerCase().includes(normalizedFilter)
    );
  }, [childrenColumnName, dataSource, expandedRows, filterText, rowKey]);

  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * currentPageSize;
    return filteredRows.slice(start, start + currentPageSize);
  }, [currentPage, currentPageSize, filteredRows]);

  const itemCount = total ?? filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(itemCount / currentPageSize));

  const exportCsv = () => {
    const headers = visibleColumns.map((column) => String(column.title));
    const rows = filteredRows.map(({ record }) =>
      visibleColumns.map((column) => {
        const value = getValue(record, column.dataIndex);
        return `"${String(value ?? '').replaceAll('"', '""')}"`;
      })
    );
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${storageKey ?? 'data-grid'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleRow = (key: string) => {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {headerContent}
      {enableToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={filterText}
              onChange={(event) => {
                setFilterText(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter records"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                <Columns3Icon data-icon="inline-start" />
                Columns
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  {normalizedColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={!hiddenColumns.has(column.id)}
                      onCheckedChange={(checked) => {
                        setHiddenColumns((current) => {
                          const next = new Set(current);
                          if (checked) {
                            next.delete(column.id);
                          } else {
                            next.add(column.id);
                          }
                          return next;
                        });
                      }}
                    >
                      {column.title}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="outline" onClick={exportCsv}>
              <DownloadIcon data-icon="inline-start" />
              CSV
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {expandable && <TableHead className="w-10" />}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={column.className}
                  style={{ width: column.width }}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: Math.min(currentPageSize, 5) }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {expandable && (
                      <TableCell>
                        <Skeleton className="h-5 w-5" />
                      </TableCell>
                    )}
                    {visibleColumns.map((column, columnIndex) => (
                      <TableCell key={column.id ?? columnIndex}>
                        <Skeleton className="h-5 w-full max-w-40" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : visibleRows.map(({ record, level, key, hasChildren }) => (
                  <TableRow
                    key={key}
                    className={cn(onRowDoubleClick && 'cursor-pointer')}
                    onDoubleClick={() => onRowDoubleClick?.(record)}
                  >
                    {expandable && (
                      <TableCell>
                        {hasChildren ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleRow(key)}
                            aria-label={expandedRows.has(key) ? 'Collapse row' : 'Expand row'}
                          >
                            {expandedRows.has(key) ? (
                              <ChevronDownIcon data-icon="inline-start" />
                            ) : (
                              <ChevronRightIcon data-icon="inline-start" />
                            )}
                          </Button>
                        ) : (
                          <span className="block size-7" />
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.map((column, columnIndex) => {
                      const value = getValue(record, column.dataIndex);
                      return (
                        <TableCell
                          key={column.id}
                          className={column.className}
                          style={
                            columnIndex === 0 && level
                              ? { paddingLeft: `${level * 1.25 + 0.5}rem` }
                              : undefined
                          }
                        >
                          {column.render
                            ? column.render(value ?? record, record, columnIndex)
                            : String(value ?? '')}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            {!loading && visibleRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (expandable ? 1 : 0)}
                  className="h-32 text-center text-muted-foreground"
                >
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {visibleRows.length} of {itemCount} records
        </span>
        <div className="flex items-center gap-2">
          {showSizeChanger && (
            <select
              className="h-8 rounded-lg border bg-background px-2 text-sm text-foreground"
              value={currentPageSize}
              onChange={(event) => {
                setCurrentPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Previous
          </Button>
          <span className="min-w-16 text-center text-xs">
            {currentPage} / {pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= pageCount}
            onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
