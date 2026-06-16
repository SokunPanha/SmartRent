import type { NextAuthConfig } from 'next-auth';

const PUBLIC_PREFIXES = ['/login'];

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
