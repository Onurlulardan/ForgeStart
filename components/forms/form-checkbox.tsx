'use client';

import { type ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from './form-field';
import { cn } from '@/lib/utils';

export interface FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  containerClassName?: string;
}

export function FormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, label, description, disabled, containerClassName }: FormCheckboxProps<TFieldValues, TName>) {
  return (
    <FormField<TFieldValues, TName>
      name={name}
      description={description}
      className={cn('flex-row items-start gap-3', containerClassName)}
    >
      {(field) => (
        <div className="flex items-start gap-3">
          <Checkbox
            id={field.name}
            checked={Boolean(field.value)}
            onCheckedChange={(value) => field.onChange(Boolean(value))}
            disabled={disabled}
          />
          {label && (
            <label htmlFor={field.name} className="text-sm font-medium leading-snug">
              {label}
            </label>
          )}
        </div>
      )}
    </FormField>
  );
}
