'use client';

import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import { type FormEvent, type FormHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FormProps<TValues extends FieldValues>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children' | 'defaultValue'> {
  schema?: ZodType<TValues>;
  defaultValues?: DefaultValues<TValues>;
  values?: TValues;
  mode?: UseFormProps<TValues>['mode'];
  onSubmit: SubmitHandler<TValues>;
  onInvalid?: (errors: unknown) => void;
  children: ReactNode | ((form: UseFormReturn<TValues>) => ReactNode);
  resetOnSuccess?: boolean;
}

export function Form<TValues extends FieldValues>({
  schema,
  defaultValues,
  values,
  mode = 'onSubmit',
  onSubmit,
  onInvalid,
  children,
  resetOnSuccess = false,
  className,
  ...formProps
}: FormProps<TValues>) {
  const form = useForm<TValues>({
    resolver: schema
      ? (zodResolver(schema as never) as unknown as Resolver<TValues>)
      : undefined,
    defaultValues,
    values,
    mode,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    await form.handleSubmit(async (data) => {
      await (onSubmit as SubmitHandler<FieldValues>)(data as FieldValues);
      if (resetOnSuccess) form.reset();
    }, onInvalid)(event);
  };

  return (
    <FormProvider {...(form as unknown as UseFormReturn<FieldValues>)}>
      <form
        {...formProps}
        onSubmit={handleSubmit}
        noValidate
        className={cn('flex flex-col gap-4', className)}
      >
        {typeof children === 'function' ? children(form) : children}
      </form>
    </FormProvider>
  );
}
