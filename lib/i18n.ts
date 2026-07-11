import { AppLanguage } from './types';

/** Picks the correct bilingual value (English vs Khmer) for the active app locale. */
export function pickLocale<T extends string | undefined>(lang: AppLanguage, en: T, kh: T): T {
  return lang === 'en' ? en : kh;
}
