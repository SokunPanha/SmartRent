import { PageSkeleton } from '@/components/layout/PageSkeleton';

/**
 * Route-transition fallback for the authenticated area. Shown by Next.js while
 * a route segment's server component renders (including the async permission
 * checks on the admin pages, and on-demand compilation in dev). Client pages
 * additionally gate their own content on TanStack Query's loading state, so the
 * skeleton carries through seamlessly until the initial data resolves.
 */
export default function AppLoading() {
  return <PageSkeleton />;
}
