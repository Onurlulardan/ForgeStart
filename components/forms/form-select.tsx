'use client';

import { type ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { FormField } from './form-field';

export interface FormSelectOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  options: FormSelectOption[];
  disabled?: boolean;
  containerClassName?: string;
  emptyValue?: string;
}

export function FormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  placeholder,
  options,
  disabled,
  containerClassName,
  emptyValue,
}: FormSelectProps<TFieldValues, TName>) {
  return (
    <FormField<TFieldValues, TName>
      name={name}
      label={label}
      description={description}
      className={containerClassName}
    >
      {(field) => {
        const value = (field.value as string | null | undefined) ?? emptyValue ?? '';
        const selected = options.find((option) => option.value === value);
        return (
          <Select
            value={value}
            onValueChange={(next) => field.onChange(next === emptyValue ? null : next)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              {selected ? (
                selected.label
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        );
      }}
    </FormField>
  );
}
