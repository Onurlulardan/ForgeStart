'use client';

import {
  Controller,
  useFormContext,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { type ReactNode } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: (field: ControllerRenderProps<TFieldValues, TName>) => ReactNode;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, label, description, className, children }: FormFieldProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          className={cn(className)}
          data-invalid={fieldState.invalid ? true : undefined}
        >
          {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
          {children(field)}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.error?.message && (
            <FieldError errors={[{ message: fieldState.error.message }]} />
          )}
        </Field>
      )}
    />
  );
}
