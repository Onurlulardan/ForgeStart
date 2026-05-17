'use client';

import { useCallback } from 'react';
import type { Table } from '@tanstack/react-table';

export type GridExportFormat = 'csv' | 'xlsx';

export interface UseGridExportOptions<TData> {
  table: Table<TData>;
  fileName?: string;
}

function escapeCsvCell(value: unknown): string {
  if (value == null) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function useGridExport<TData>({ table, fileName = 'data-grid' }: UseGridExportOptions<TData>) {
  const buildRows = useCallback(() => {
    const visibleColumns = table
      .getAllLeafColumns()
      .filter((column) => column.getIsVisible() && !column.id.startsWith('__'));

    const headers = visibleColumns.map((column) => {
      const header = column.columnDef.header;
      if (typeof header === 'string') return header;
      return column.id;
    });

    const rows = table.getFilteredRowModel().rows.map((row) =>
      visibleColumns.map((column) => row.getValue(column.id))
    );

    return { headers, rows };
  }, [table]);

  const exportCsv = useCallback(() => {
    const { headers, rows } = buildRows();
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
      .join('\n');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${fileName}.csv`);
  }, [buildRows, fileName]);

  const exportXlsx = useCallback(async () => {
    const XLSX = await import('xlsx');
    const { headers, rows } = buildRows();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const out = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    downloadBlob(
      new Blob([out], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `${fileName}.xlsx`
    );
  }, [buildRows, fileName]);

  return { exportCsv, exportXlsx };
}
