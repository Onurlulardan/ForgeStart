import type { ReactNode } from 'react';
import { InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center',
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <InboxIcon className="size-6" />}
      </div>
      {title && <h3 className="text-base font-medium text-foreground">{title}</h3>}
      {description && (
        <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
