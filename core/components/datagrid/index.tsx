'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
  onRowDoubleClick,
  columns,
  dataSource = [],
  expandable,
}: DataGridProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const childrenColumnName = expandable?.childrenColumnName ?? 'children';

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

  const visibleRows = useMemo(() => {
    const flat = flattenRows(dataSource, rowKey, childrenColumnName, expandedRows);
    const start = (currentPage - 1) * currentPageSize;
    return flat.slice(start, start + currentPageSize);
  }, [childrenColumnName, currentPage, currentPageSize, dataSource, expandedRows, rowKey]);

  const itemCount = total ?? dataSource.length;
  const pageCount = Math.max(1, Math.ceil(itemCount / currentPageSize));

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
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {expandable && <TableHead className="w-10" />}
              {columns.map((column, index) => (
                <TableHead
                  key={column.key ?? String(column.dataIndex ?? index)}
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
                    {columns.map((column, columnIndex) => (
                      <TableCell key={column.key ?? columnIndex}>
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
                    {columns.map((column, columnIndex) => {
                      const value = getValue(record, column.dataIndex);
                      return (
                        <TableCell
                          key={column.key ?? String(column.dataIndex ?? columnIndex)}
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
                  colSpan={columns.length + (expandable ? 1 : 0)}
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
