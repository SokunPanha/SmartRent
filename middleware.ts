import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Edge-safe auth instance (no Credentials provider / Node deps) used purely for
// the `authorized` callback that gates routes.
export default NextAuth(authConfig).auth;

export const config = {
  // Run on everything except Auth.js endpoints, Next internals and static files.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
