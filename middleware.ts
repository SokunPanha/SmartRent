import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Redirected away from if a staff session exists (the login page itself).
const PUBLIC_PREFIXES = ['/login'];

// Always public, regardless of a staff session — these authenticate the
// request their own way (a webhook secret, or Telegram's signed initData)
// and must return their normal response even to a browser that happens to
// also be logged in as staff, not a redirect.
const ALWAYS_PUBLIC_PREFIXES = ['/api/telegram/webhook', '/telegram/portal', '/api/telegram-app'];

const secret = process.env.AUTH_SECRET ? new TextEncoder().encode(process.env.AUTH_SECRET) : null;

/**
 * Verifies the `session` cookie set by the NestJS backend's POST
 * /api/auth/login (proxied through Next.js — see next.config.ts). This
 * replaces NextAuth's middleware-level `authorized` callback now that the
 * backend, not NextAuth, issues and owns the session JWT.
 */
async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('session')?.value;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (ALWAYS_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const loggedIn = await isAuthenticated(req);

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  if (isPublic) {
    // Bounce already-authenticated users away from the login page.
    if (loggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (!loggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Auth.js endpoints, Next internals and static files.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
