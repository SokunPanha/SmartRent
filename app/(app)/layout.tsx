import { AppShell } from '@/components/layout/AppShell';

/**
 * Layout for the authenticated area. Middleware guarantees a session before any
 * of these routes render, so the app chrome can assume a logged-in user.
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
