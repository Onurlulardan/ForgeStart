'use client';

import { type ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { MultiSelectList } from '@/components/app/multi-select-list';
import { FormField } from './form-field';

export interface FormMultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface FormMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  options: FormMultiSelectOption[];
  emptyText?: string;
  disabled?: boolean;
  containerClassName?: string;
}

export function FormMultiSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  options,
  emptyText,
  disabled,
  containerClassName,
}: FormMultiSelectProps<TFieldValues, TName>) {
  return (
    <FormField<TFieldValues, TName>
      name={name}
      label={label}
      description={description}
      className={containerClassName}
    >
      {(field) => (
        <MultiSelectList
          value={(field.value as string[]) ?? []}
          options={options}
          onChange={(value) => field.onChange(value)}
          emptyText={emptyText}
          disabled={disabled}
        />
      )}
    </FormField>
  );
}
