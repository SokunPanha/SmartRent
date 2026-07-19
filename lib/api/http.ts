import { NextResponse } from 'next/server';

/**
 * Small response/error helpers shared by every route handler so success and
 * failure payloads are consistent: `{ data }` on success, `{ error }` on
 * failure.
 */

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export function notFound(error = 'Not found') {
  return NextResponse.json({ error }, { status: 404 });
}

export function forbidden(error = 'Forbidden') {
  return NextResponse.json({ error }, { status: 403 });
}

export function serverError(err: unknown) {
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  console.error('[api] error:', err);
  return NextResponse.json({ error: message }, { status: 500 });
}

/** Generate a prefixed, reasonably-unique application id (e.g. "room-lq3..."). */
export function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .substring(2, 8)}`;
}

/** Parse a JSON body, returning null on malformed input. */
export async function readJson<T = Record<string, unknown>>(
  req: Request
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Assert that every key in `required` is present (not undefined/null, and not
 * a blank/whitespace-only string) on `body`. Returns the name of the first
 * missing field, or null when all are present.
 */
export function missingField(
  body: Record<string, unknown>,
  required: string[]
): string | null {
  for (const key of required) {
    const value = body[key];
    if (value === undefined || value === null) return key;
    if (typeof value === 'string' && value.trim() === '') return key;
  }
  return null;
}

export const MIN_PASSWORD_LENGTH = 6;
