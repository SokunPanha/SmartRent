import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const defaultLocale = 'en';
export const locales = ['en', 'km'] as const;
export type Locale = (typeof locales)[number];

// One JSON file per feature area, per locale. Keeps concurrent edits from
// different features from colliding in a single giant messages file.
const NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'admin',
  'invoices',
  'meterReadings',
  'properties',
  'reports',
  'tenants',
  'settings',
] as const;

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get('locale')?.value;
  const locale = locales.includes(cookieLocale as Locale) ? (cookieLocale as Locale) : defaultLocale;

  const modules = await Promise.all(
    NAMESPACES.map((ns) => import(`../messages/${locale}/${ns}.json`))
  );
  const messages = Object.assign({}, ...modules.map((m) => m.default));

  return { locale, messages };
});
