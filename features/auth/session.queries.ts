'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api/client';

export interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  roleId: string | null;
  isSuperAdmin: boolean;
  preferredLang: string | null;
}

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Client-side replacement for next-auth/react's `useSession()`. The staff
 * session now lives in the NestJS backend (JWT in an httpOnly cookie), so
 * this just asks it who's signed in via GET /api/auth/me (proxied through
 * Next.js). Mirrors next-auth's `{ data: { user }, status }` shape so
 * existing call sites (store/rent-store.tsx, LangSync) barely change.
 */
export function useSession() {
  const query = useQuery({
    queryKey: ['session', 'me'],
    queryFn: () => apiGet<SessionUser>('/api/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const status: SessionStatus = query.isPending
    ? 'loading'
    : query.data
      ? 'authenticated'
      : 'unauthenticated';

  return {
    data: query.data ? { user: query.data } : null,
    status,
  };
}

/** POST /api/auth/login — throws on invalid credentials (see lib/api/client.ts). */
export function login(email: string, password: string) {
  return apiPost<SessionUser>('/api/auth/login', { email, password });
}

/** POST /api/auth/logout, clearing the session cookie server-side. */
export function logout() {
  return apiPost('/api/auth/logout');
}
