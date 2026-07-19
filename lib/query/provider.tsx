'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Wraps the app in a TanStack Query client. The client is created lazily in
 * state so it is stable across re-renders but unique per browser session.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cached data is treated as fresh for 5 minutes, so switching back
            // to a previously-visited page renders instantly from cache with
            // no refetch. Domain data here changes on user action (which
            // invalidates the relevant keys), not spontaneously, so a long
            // staleTime is safe.
            staleTime: 5 * 60_000,
            // Keep unused query data in memory for 10 minutes after the last
            // observer unmounts, so navigating away and back reuses the cache.
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
