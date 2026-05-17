'use client';

import { type ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { RichTextEditor } from '@/components/rich-text';
import { FormField } from './form-field';

export interface FormRichTextProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  containerClassName?: string;
}

export function FormRichText<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  placeholder,
  containerClassName,
}: FormRichTextProps<TFieldValues, TName>) {
  return (
    <FormField<TFieldValues, TName>
      name={name}
      label={label}
      description={description}
      className={containerClassName}
    >
      {(field) => (
        <RichTextEditor
          value={(field.value as string | undefined) ?? ''}
          onChange={(html) => field.onChange(html)}
          placeholder={placeholder}
        />
      )}
    </FormField>
  );
}
