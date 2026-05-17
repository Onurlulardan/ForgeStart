import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJson<T>(request: Request, schema: ZodSchema<T>) {
  try {
    const body = await request.json();
    return { ok: true as const, data: schema.parse(body) };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false as const,
        response: jsonError(error.issues[0]?.message ?? 'Invalid request body', 400),
      };
    }

    return { ok: false as const, response: jsonError('Invalid JSON body', 400) };
  }
}

export function handleRouteError(scope: string, error: unknown) {
  console.error(scope, error);
  return jsonError('Internal server error', 500);
}
