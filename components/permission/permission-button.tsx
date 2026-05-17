'use client';

import { forwardRef, type ComponentProps } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePermission } from '@/lib/auth/client-permissions';

export interface PermissionButtonProps extends ComponentProps<typeof Button> {
  resource: string;
  action: string;
  organizationId?: string;
  hideWhenDenied?: boolean;
}

export const PermissionButton = forwardRef<HTMLButtonElement, PermissionButtonProps>(
  function PermissionButton(
    { resource, action, organizationId, hideWhenDenied = false, disabled, children, ...props },
    ref
  ) {
    const t = useTranslations('permission');
    const allowed = usePermission(resource, action, organizationId);

    if (!allowed && hideWhenDenied) {
      return null;
    }

    if (!allowed) {
      return (
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="inline-flex" aria-disabled>
                <Button {...props} ref={ref} disabled aria-disabled>
                  {children}
                </Button>
              </span>
            }
          />
          <TooltipContent>{t('denied')}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Button ref={ref} disabled={disabled} {...props}>
        {children}
      </Button>
    );
  }
);
