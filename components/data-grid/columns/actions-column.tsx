'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RowAction } from '../types';

export function actionsColumn<TData>(actions: (row: TData) => RowAction<TData>[]): ColumnDef<TData> {
  return {
    id: '__actions',
    enableHiding: false,
    enableSorting: false,
    size: 60,
    header: '',
    cell: ({ row }) => {
      const items = actions(row.original).filter((action) => {
        if (typeof action.disabled === 'function') return !action.disabled(row.original);
        return true;
      });

      if (!items.length) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              {items.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  variant={action.destructive ? 'destructive' : 'default'}
                  onClick={() => action.onSelect(row.original)}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}
