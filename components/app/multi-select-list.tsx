'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectListProps {
  value: string[];
  options: MultiSelectOption[];
  emptyText?: string;
  disabled?: boolean;
  onChange: (value: string[]) => void;
}

export function MultiSelectList({
  value,
  options,
  emptyText = 'No options available.',
  disabled,
  onChange,
}: MultiSelectListProps) {
  const selected = new Set(value);

  const toggle = (optionValue: string) => {
    const next = new Set(selected);
    if (next.has(optionValue)) {
      next.delete(optionValue);
    } else {
      next.add(optionValue);
    }
    onChange([...next]);
  };

  return (
    <div className="max-h-64 overflow-y-auto rounded-lg border bg-background p-1">
      {options.length ? (
        options.map((option) => {
          const checked = selected.has(option.value);
          return (
            <button
              type="button"
              key={option.value}
              className={cn(
                'flex w-full cursor-pointer items-start gap-3 rounded-md p-2 text-left text-sm transition-colors hover:bg-muted',
                checked && 'bg-accent text-accent-foreground',
                disabled && 'cursor-not-allowed opacity-60'
              )}
              disabled={disabled}
              onClick={() => toggle(option.value)}
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                tabIndex={-1}
                aria-label={option.label}
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">{option.label}</span>
                {option.description && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </span>
            </button>
          );
        })
      ) : (
        <div className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
      )}
    </div>
  );
}
