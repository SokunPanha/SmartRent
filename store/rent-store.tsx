'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSession } from '@/features/auth/session.queries';
import { UserRole, AppLanguage } from '@/lib/types';
import type { Locale } from '@/i18n/request';

/**
 * UI-preference store.
 *
 * Holds client-side UI concerns: the active language, a hydration flag and a
 * toast helper. The acting role + identity are now derived from the
 * authenticated session (NextAuth) rather than a simulated toggle. All domain
 * data lives in Postgres and is fetched per-feature with TanStack Query hooks.
 *
 * `lang` also doubles as the key for bilingual data fields entered by users
 * (e.g. `tenant.name` vs `tenant.nameKh`) — that's a data concern, not a UI
 * string, so it stays separate from next-intl's message catalog.
 */

interface RentContextValue {
  mounted: boolean;
  /**
   * False until NextAuth's `useSession()` has resolved. `mounted` alone
   * flips true on the first client render, well before the session fetch
   * completes — gating access-control redirects on `mounted` instead of
   * this can incorrectly bounce an authorized user (session not loaded
   * yet reads as "no permission").
   */
  sessionLoading: boolean;
  lang: AppLanguage;
  handleLangToggle: () => void;
  triggerToast: (msg: string) => void;
  // Identity (from the session)
  activeRole: UserRole; // role name (dynamic)
  roleId: string | null;
  isSuperAdmin: boolean;
  userName: string;
  userEmail: string;
}

const RentContext = createContext<RentContextValue | null>(null);

// next-intl uses the ISO code 'km' for Khmer; the app's domain model
// (AppLanguage, bilingual `nameKh` fields) predates that and uses 'kh'.
// These two convert between them at the store boundary.
function localeToLang(locale: string): AppLanguage {
  return locale === 'km' ? 'kh' : 'en';
}
function langToLocale(lang: AppLanguage): Locale {
  return lang === 'kh' ? 'km' : 'en';
}

export function RentProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const sessionLoading = sessionStatus === 'loading';
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const locale = useLocale();
  const lang = localeToLang(locale);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerToast = (msg: string) => toast(msg);

  const handleLangToggle = () => {
    const nextLang: AppLanguage = lang === 'en' ? 'kh' : 'en';
    document.cookie = `locale=${langToLocale(nextLang)}; path=/; max-age=31536000`;
    triggerToast(nextLang === 'kh' ? 'ភាសា៖ ខ្មែរ' : 'Language: English');
    router.refresh();
  };

  const activeRole = (session?.user?.role ?? '') as UserRole;
  const roleId = session?.user?.roleId ?? null;
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false;
  const userName = session?.user?.name ?? '';
  const userEmail = session?.user?.email ?? '';

  const value = useMemo<RentContextValue>(
    () => ({
      mounted,
      sessionLoading,
      lang,
      handleLangToggle,
      triggerToast,
      activeRole,
      roleId,
      isSuperAdmin,
      userName,
      userEmail,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mounted, sessionLoading, lang, activeRole, roleId, isSuperAdmin, userName, userEmail]
  );

  return <RentContext.Provider value={value}>{children}</RentContext.Provider>;
}

export function useRent(): RentContextValue {
  const ctx = useContext(RentContext);
  if (!ctx) {
    throw new Error('useRent must be used within a <RentProvider>');
  }
  return ctx;
}
