'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useRent } from '@/store/rent-store';
import { ThemeToggle } from './ThemeToggle';

export function AppHeader() {
  const { lang, handleLangToggle } = useRent();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 shadow-sm print:hidden">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 h-4" />
        <h2 className="font-sans text-sm font-extrabold uppercase tracking-tight">
          {lang === 'en' ? 'Property Management' : 'ការគ្រប់គ្រងអចលនទ្រព្យ'}
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* Cambodia exchange-rate indicator */}
        <div className="hidden items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[10px] tracking-wide text-muted-foreground lg:flex">
          <span className="mr-1 font-sans text-[9px] font-bold uppercase tracking-wider text-indigo-400">
            Fix rate:
          </span>
          $1 = 4,100 KHR (៛)
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLangToggle}
          className="gap-1.5 font-bold"
        >
          <Languages className="h-3.5 w-3.5 text-indigo-400" />
          <span>{lang === 'en' ? 'ភាសាខ្មែរ' : 'EN'}</span>
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}
