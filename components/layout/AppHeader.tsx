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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 bg-background/85 px-4 backdrop-blur-md md:h-20 md:rounded-t-(--radius-panel) md:px-8 print:hidden">
      <div className="flex min-w-0 items-center gap-2">
        {/* Desktop keeps the persistent sidebar + its toggle. */}
        <SidebarTrigger className="-ml-1 hidden size-10 rounded-full bg-card shadow-card md:inline-flex" />

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

        <h2 className="truncate font-sans text-base font-semibold tracking-tight md:ml-2 md:text-lg">
          {t('property_management')}
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/* Cambodia exchange-rate indicator */}
        <div className="hidden h-10 items-center gap-1 rounded-full bg-card px-4 text-xs text-muted-foreground shadow-card lg:flex">
          <span className="mr-1 text-xs font-semibold text-primary">
            {t('fix_rate_label')}
          </span>
          {fixRateValue}
        </div>

        <Button
          variant="outline"
          onClick={handleLangToggle}
          className="size-10 gap-1.5 px-0 font-semibold sm:w-auto sm:px-4"
          aria-label={lang === 'en' ? t('khemar_lang') : t('english_lang')}
        >
          <Languages className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">{lang === 'en' ? t('khemar_lang') : t('english_lang')}</span>
        </Button>

        <ThemePicker />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
