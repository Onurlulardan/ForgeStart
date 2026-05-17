import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status?: string | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status?.toUpperCase() ?? 'UNKNOWN';
  const tone =
    normalized === 'ACTIVE' || normalized === 'SUCCESS'
      ? 'text-emerald-700 bg-emerald-50 ring-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:ring-emerald-900'
      : normalized === 'INACTIVE'
        ? 'text-amber-700 bg-amber-50 ring-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:ring-amber-900'
        : 'text-red-700 bg-red-50 ring-red-200 dark:text-red-300 dark:bg-red-950/40 dark:ring-red-900';

  return (
    <Badge variant="secondary" className={cn('rounded-md px-2 py-0.5 font-medium ring-1', tone)}>
      {normalized}
    </Badge>
  );
}
