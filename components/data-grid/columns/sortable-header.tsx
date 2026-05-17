'use client';

import type { Column } from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

export interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  children: ReactNode;
}

export function SortableHeader<TData, TValue>({
  column,
  children,
}: SortableHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 px-2 font-medium"
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {children}
      {sorted === 'asc' ? (
        <ArrowUpIcon className="size-3.5" />
      ) : sorted === 'desc' ? (
        <ArrowDownIcon className="size-3.5" />
      ) : (
        <ArrowUpDownIcon className="size-3.5 opacity-50" />
      )}
    </Button>
  );
}
