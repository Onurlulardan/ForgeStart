'use client';

import { type ComponentProps, type ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField } from './form-field';

export interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ComponentProps<typeof Input>, 'name' | 'value' | 'onChange' | 'onBlur' | 'defaultValue'> {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  containerClassName?: string;
}

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  containerClassName,
  ...inputProps
}: FormInputProps<TFieldValues, TName>) {
  return (
    <FormField<TFieldValues, TName>
      name={name}
      label={label}
      description={description}
      className={containerClassName}
    >
      {(field) => (
        <Input
          id={field.name}
          {...inputProps}
          value={field.value ?? ''}
          onChange={(event) => field.onChange(event.target.value)}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
        />
      )}
    </FormField>
  );
}
