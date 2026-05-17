'use client';

import { type ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { FormField } from './form-field';

export interface FormSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  containerClassName?: string;
}

export function FormSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, label, description, disabled, containerClassName }: FormSwitchProps<TFieldValues, TName>) {
  return (
    <FormField<TFieldValues, TName>
      name={name}
      description={description}
      className={containerClassName}
    >
      {(field) => (
        <div className="flex items-center justify-between gap-3">
          {label && (
            <label htmlFor={field.name} className="text-sm font-medium">
              {label}
            </label>
          )}
          <Switch
            id={field.name}
            checked={Boolean(field.value)}
            onCheckedChange={(value) => field.onChange(Boolean(value))}
            disabled={disabled}
          />
        </div>
      )}
    </FormField>
  );
}
