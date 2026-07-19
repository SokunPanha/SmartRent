'use client';

import { useTranslations } from 'next-intl';
import { Property, AppLanguage } from '@/lib/types';
import { pickLocale } from '@/lib/i18n';

/**
 * Checkbox list of buildings for assigning a user to specific properties.
 * No selection = unrestricted (the user sees every building).
 */
export function BuildingPicker({
  properties,
  selected,
  onToggle,
  lang,
}: {
  properties: Property[];
  selected: string[];
  onToggle: (id: string) => void;
  lang: AppLanguage;
}) {
  const t = useTranslations('Admin');
  return (
    <div className="space-y-1.5">
      <label className="block font-sans text-xs font-medium text-muted-foreground">
        {t('buildings')}
      </label>
      <div className="max-h-40 divide-y divide-border overflow-y-auto rounded-lg border border-border">
        {properties.length === 0 ? (
          <p className="p-3 text-xs italic text-muted-foreground">—</p>
        ) : (
          properties.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50"
            >
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => onToggle(p.id)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-foreground">{pickLocale(lang, p.name, p.nameKh)}</span>
            </label>
          ))
        )}
      </div>
      <p className="text-[11px] italic text-muted-foreground">{t('buildings_hint')}</p>
    </div>
  );
}
