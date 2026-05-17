'use client';

import { Columns3Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ColumnVisibilityProps<TData> {
  table: Table<TData>;
}

export function ColumnVisibility<TData>({ table }: ColumnVisibilityProps<TData>) {
  const t = useTranslations('dataGrid');
  const toggleable = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide() && !column.id.startsWith('__'));

  if (!toggleable.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <Columns3Icon />
        {t('columns')}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          {toggleable.map((column) => {
            const header = column.columnDef.header;
            const label = typeof header === 'string' ? header : column.id;
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
              >
                {label}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
