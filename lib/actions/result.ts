export interface ActionSuccess<T = unknown> {
  ok: true;
  data: T;
}

export interface ActionFailure {
  ok: false;
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}

export type ActionResult<T = unknown> = ActionSuccess<T> | ActionFailure;

export function success<T>(data: T): ActionSuccess<T> {
  return { ok: true, data };
}

export function failure(error: string, code?: string, fieldErrors?: Record<string, string[]>): ActionFailure {
  return { ok: false, error, code, fieldErrors };
}
