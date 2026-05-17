'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';

export function selectColumn<TData>(): ColumnDef<TData> {
  return {
    id: '__select',
    enableHiding: false,
    enableSorting: false,
    size: 36,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Select row"
      />
    ),
  };
}
