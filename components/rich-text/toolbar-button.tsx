'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton({ active, className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
          active && 'bg-accent text-accent-foreground',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
