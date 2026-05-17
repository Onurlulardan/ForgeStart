import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 16, className, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn('inline-flex items-center gap-2 text-muted-foreground', className)}
    >
      <Loader2Icon className="animate-spin" style={{ width: size, height: size }} />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}
