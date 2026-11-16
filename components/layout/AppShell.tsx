'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useRent } from '@/store/rent-store';
import { setUsdKhrRate } from '@/lib/format';
import { useSettings } from '@/features/settings/settings.queries';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

/**
 * Application chrome shared across every route: the persistent sidebar
 * navigation + top header. Route content is rendered into the inset area.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { mounted } = useRent();
  const t = useTranslations('Common');
  const { data: settings } = useSettings();

  // usdToKhr/formatKHRFromUSD read a module-level rate rather than a prop, so
  // this is the one place that needs to sync it once the configurable
  // exchange rate loads.
  useEffect(() => {
    if (settings) setUsdKhrRate(settings.exchangeRateKhr);
  }, [settings]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background font-sans text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 animate-pulse text-xs font-bold text-muted-foreground">
          {t('loading_system')}
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 print:!m-0 print:!shadow-none">
        <AppHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 overflow-x-clip px-4 pt-2 pb-8 md:px-8 md:pb-10 print:p-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
