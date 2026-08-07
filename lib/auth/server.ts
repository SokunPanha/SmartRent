import { cookies } from 'next/headers';
import type { PermissionKey } from '@/lib/permissions';

/**
 * Server-side (RSC) access to the signed-in user's identity/permissions.
 * The staff session now lives entirely in the NestJS backend (JWT in an
 * httpOnly `session` cookie); server components can't reach it through the
 * browser-facing `/api/*` proxy (relative fetches don't work during SSR), so
 * this talks to the backend directly, forwarding the cookie by hand.
 */
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4001';

export interface ServerSessionUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  roleId: string | null;
  isSuperAdmin: boolean;
  preferredLang: string | null;
}

async function backendGet<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  if (!session) return null;

  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { Cookie: `session=${session.value}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  return (json?.data as T) ?? null;
}

export async function getServerSessionUser(): Promise<ServerSessionUser | null> {
  return backendGet<ServerSessionUser>('/api/auth/me');
}

/** Mirrors GET /api/permissions/me's `{ isSuperAdmin, permissions }` shape. */
export async function userCan(permission: PermissionKey): Promise<boolean> {
  const result = await backendGet<{ isSuperAdmin: boolean; permissions: string[] }>(
    '/api/permissions/me'
  );
  if (!result) return false;
  if (result.isSuperAdmin) return true;
  return result.permissions.includes(permission);
}
