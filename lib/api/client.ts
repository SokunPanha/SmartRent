/**
 * Thin client-side fetch wrapper for the `/api/*` route handlers.
 *
 * Every endpoint returns `{ data }` on success and `{ error }` on failure;
 * `request` unwraps that envelope and throws on non-2xx so callers (TanStack
 * Query) receive either the payload or an Error.
 */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return json?.data as T;
}

export const apiGet = <T>(url: string) => request<T>(url, { method: 'GET' });

export const apiPost = <T>(url: string, body?: unknown) =>
  request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export const apiPatch = <T>(url: string, body: unknown) =>
  request<T>(url, { method: 'PATCH', body: JSON.stringify(body) });

export const apiPut = <T>(url: string, body: unknown) =>
  request<T>(url, { method: 'PUT', body: JSON.stringify(body) });

export const apiDelete = <T>(url: string) => request<T>(url, { method: 'DELETE' });
