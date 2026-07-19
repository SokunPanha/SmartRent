'use client';

import { ArrowLeft, Languages } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useRent } from '@/store/rent-store';
import { formatKHR } from '@/lib/format';
import { useSettings } from '@/features/settings/settings.queries';
import { ThemeToggle } from './ThemeToggle';
import { ThemePicker } from './ThemePicker';
import { UserMenu } from './UserMenu';

const HOME_PATH = '/dashboard';

export function AppHeader() {
  const { lang, handleLangToggle } = useRent();
  const t = useTranslations('Common');
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === HOME_PATH;
  const { data: settings } = useSettings();
  const fixRateValue = settings ? `$1 = ${formatKHR(settings.exchangeRateKhr)}` : t('fix_rate_value');

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 shadow-sm print:hidden">
      <div className="flex min-w-0 items-center gap-2">
        {/* Desktop keeps the persistent sidebar + its toggle. */}
        <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
        <Separator orientation="vertical" className="mr-1 hidden h-4 shrink-0 md:block" />

        {/* Mobile has no drawer: the dashboard grid is the only nav surface,
            so every other page gets a back-to-home button instead. */}
        {!isHome && (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-ml-1 md:hidden"
              onClick={() => router.push(HOME_PATH)}
              aria-label={t('back_to_home')}
            >
              <ArrowLeft />
            </Button>
            <Separator orientation="vertical" className="mr-1 h-4 shrink-0 md:hidden" />
          </>
        )}

        <h2 className="truncate font-sans text-sm font-semibold tracking-tight">
          {t('property_management')}
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* Cambodia exchange-rate indicator */}
        <div className="hidden items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground lg:flex">
          <span className="mr-1 text-[11px] font-semibold text-primary">
            {t('fix_rate_label')}
          </span>
          {fixRateValue}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLangToggle}
          className="gap-1.5 font-bold"
        >
          <Languages className="h-3.5 w-3.5 text-primary" />
          <span>{lang === 'en' ? t('khemar_lang') : t('english_lang')}</span>
        </Button>

        <ThemePicker />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
