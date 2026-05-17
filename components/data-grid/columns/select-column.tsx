'use client';

import { useTranslations } from 'next-intl';
import type { ColumnDef, Row, Table } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';

function SelectAllRowsCheckbox<TData>({ table }: { table: Table<TData> }) {
  const t = useTranslations('dataGrid');

  return (
    <Checkbox
      checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
      aria-label={t('selectAllRows')}
    />
  );
}

function SelectRowCheckbox<TData>({ row }: { row: Row<TData> }) {
  const t = useTranslations('dataGrid');

  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
      aria-label={t('selectRow')}
    />
  );
}

export function selectColumn<TData>(): ColumnDef<TData> {
  return {
    id: '__select',
    enableHiding: false,
    enableSorting: false,
    size: 36,
    header: ({ table }) => <SelectAllRowsCheckbox table={table} />,
    cell: ({ row }) => <SelectRowCheckbox row={row} />,
  };
}
