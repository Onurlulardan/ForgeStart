import type { ReactNode } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface PageBreadcrumb {
  label: ReactNode;
  href?: string;
}

export interface PageShellProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: PageBreadcrumb[];
  children: ReactNode;
  className?: string;
}

export function PageShell({
  title,
  description,
  actions,
  breadcrumbs,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={index} className="inline-flex items-center gap-1">
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cn(isLast && 'text-foreground')}>{crumb.label}</span>
                )}
                {!isLast && <ChevronRightIcon className="size-3.5" />}
              </span>
            );
          })}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
