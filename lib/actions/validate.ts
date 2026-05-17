import type { ZodType } from 'zod';
import type { ActionFailure } from './result';
import { failure } from './result';

export type ParsedActionInput<T> =
  | { ok: true; data: T }
  | ActionFailure;

export function parseFormData<T>(schema: ZodType<T>, formData: FormData): ParsedActionInput<T> {
  const entries: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  for (const key of new Set(Array.from(formData.keys()))) {
    const values = formData.getAll(key);
    entries[key] = values.length > 1 ? values : values[0]!;
  }
  const parsed = schema.safeParse(entries);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.') || '_root';
      fieldErrors[path] = [...(fieldErrors[path] ?? []), issue.message];
    }
    return failure('Validation failed', 'VALIDATION', fieldErrors);
  }
  return { ok: true, data: parsed.data };
}

export function parseJson<T>(schema: ZodType<T>, value: unknown): ParsedActionInput<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.') || '_root';
      fieldErrors[path] = [...(fieldErrors[path] ?? []), issue.message];
    }
    return failure('Validation failed', 'VALIDATION', fieldErrors);
  }
  return { ok: true, data: parsed.data };
}
