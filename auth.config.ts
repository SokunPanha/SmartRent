import type { NextAuthConfig } from 'next-auth';

// Redirected away from if a staff session exists (the login page itself).
const PUBLIC_PREFIXES = ['/login'];

// Always public, regardless of a staff session — these authenticate the
// request their own way (a webhook secret, or Telegram's signed initData)
// and must return their normal response even to a browser that happens to
// also be logged in as staff, not a redirect. See lib/api/telegram.ts and
// lib/api/telegram-auth.ts.
const ALWAYS_PUBLIC_PREFIXES = [
  '/api/telegram/webhook',
  '/telegram/portal',
  '/api/telegram-app',
];

/**
 * Edge-safe Auth.js configuration.
 *
 * This file MUST NOT import Node-only modules (bcrypt, pg, the DB client) — it
 * is consumed by `middleware.ts`, which runs on the edge runtime. The
 * Credentials provider (which needs those) is added in `auth.ts` for the
 * Node runtime route handler.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [], // real providers are added in auth.ts
  callbacks: {
    // Route protection: every page requires a session except the public ones.
    authorized({ auth, request }) {
      const loggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (ALWAYS_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;

      const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
      if (isPublic) {
        // Bounce already-authenticated users away from the login page.
        if (loggedIn) {
          return Response.redirect(new URL('/dashboard', request.nextUrl));
        }
        return true;
      }
      return loggedIn;
    },
    // Persist id + role identity onto the JWT at sign-in.
    jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role?: string; roleId?: string | null; isSuperAdmin?: boolean };
        token.id = u.id;
        token.role = u.role;
        token.roleId = u.roleId ?? null;
        token.isSuperAdmin = !!u.isSuperAdmin;
      }
      return token;
    },
    // Expose role identity on the client-visible session.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? '';
        session.user.roleId = (token.roleId as string | null) ?? null;
        session.user.isSuperAdmin = !!token.isSuperAdmin;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
