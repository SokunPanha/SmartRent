'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useRent } from '@/store/rent-store';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

/**
 * Application chrome shared across every route: the persistent sidebar
 * navigation + top header. Route content is rendered into the inset area.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { mounted } = useRent();

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background font-sans text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-4 animate-pulse font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Loading Cambodia Property System...
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 print:!m-0 print:!shadow-none">
        <AppHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 overflow-hidden p-6 md:p-8 print:p-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
