'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Light/dark switch. Renders a stable placeholder until mounted to avoid hydration mismatch. */
export function ThemeToggle() {
  const t = useTranslations('Common');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8"
      aria-label={t('theme_toggle')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4 text-chart-1" />
        ) : (
          <Moon className="h-4 w-4 text-chart-3" />
        )
      ) : (
        <Sun className="h-4 w-4 opacity-0" />
      )}
    </Button>
  );
}
