'use client';

import { type ComponentProps, type ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from './form-field';

export interface FormTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<
    ComponentProps<typeof Textarea>,
    'name' | 'value' | 'onChange' | 'onBlur' | 'defaultValue'
  > {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  containerClassName?: string;
}

export function FormTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  containerClassName,
  ...textareaProps
}: FormTextareaProps<TFieldValues, TName>) {
  return (
    <FormField<TFieldValues, TName>
      name={name}
      label={label}
      description={description}
      className={containerClassName}
    >
      {(field) => (
        <Textarea
          id={field.name}
          {...textareaProps}
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
