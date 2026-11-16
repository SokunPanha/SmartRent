'use client';

import { useIsClient } from '@/hooks/use-is-client';
import { Check, Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ACCENTS, useAccent } from '@/components/theme/accent-provider';

/** Accent-color picker. Sits beside the light/dark toggle; available to every
 *  user as a personal preference (persisted in localStorage). */
export function ThemePicker() {
  const t = useTranslations('Common');
  const { accent, setAccent } = useAccent();
  const mounted = useIsClient();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-10"
          aria-label={t('theme_color')}
        >
          <Palette className="h-4 w-4 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t('theme_color')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACCENTS.map((a) => (
          <DropdownMenuItem
            key={a.id}
            onClick={() => setAccent(a.id)}
            className="cursor-pointer gap-2"
          >
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: a.swatch }}
            />
            <span className="flex-1">{t(a.labelKey)}</span>
            {mounted && accent === a.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
