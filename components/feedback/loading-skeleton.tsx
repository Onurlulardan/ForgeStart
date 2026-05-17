import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex gap-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-9 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton key={columnIndex} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 3, className }: CardSkeletonProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  );
}

export interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
