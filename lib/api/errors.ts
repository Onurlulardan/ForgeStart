import { AxiosError } from 'axios';
import { ZodError } from 'zod';

export interface ParsedApiError {
  message: string;
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string>;
}

interface ErrorBody {
  error?: string;
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  issues?: Array<{ path: Array<string | number>; message: string }>;
}

function parseFieldErrorsFromIssues(issues?: ErrorBody['issues']) {
  if (!issues?.length) return undefined;
  const result: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join('.') || '_root';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (typeof data === 'string') {
      return { message: data, status };
    }

    if (data && typeof data === 'object') {
      const body = data as ErrorBody;
      return {
        message: body.message ?? body.error ?? error.message,
        status,
        code: body.code,
        fieldErrors: body.fieldErrors ?? parseFieldErrorsFromIssues(body.issues),
      };
    }

    return { message: error.message, status };
  }

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || '_root';
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      message: error.issues[0]?.message ?? 'Validation error',
      code: 'VALIDATION',
      fieldErrors,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return { message: 'An unknown error occurred' };
}

export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  return parseApiError(error).message || fallback;
}
