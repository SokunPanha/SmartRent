'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { UserRole, AppLanguage } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/data';

/**
 * UI-preference store.
 *
 * Holds client-side UI concerns: the active language, a hydration flag and a
 * toast helper. The acting role + identity are now derived from the
 * authenticated session (NextAuth) rather than a simulated toggle. All domain
 * data lives in Postgres and is fetched per-feature with TanStack Query hooks.
 */

type Translation = (typeof TRANSLATIONS)['en'];

interface RentContextValue {
  mounted: boolean;
  lang: AppLanguage;
  t: Translation;
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

export function RentProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  const [lang, setLang] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('khrent_lang');
      return (stored as AppLanguage) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerToast = (msg: string) => toast(msg);

  const handleLangToggle = () => {
    const nextLang = lang === 'en' ? 'kh' : 'en';
    setLang(nextLang);
    localStorage.setItem('khrent_lang', nextLang);
    triggerToast(nextLang === 'kh' ? 'ភាសា៖ ខ្មែរ' : 'Language: English');
  };

  const t = TRANSLATIONS[lang];

  const activeRole = (session?.user?.role ?? '') as UserRole;
  const roleId = session?.user?.roleId ?? null;
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false;
  const userName = session?.user?.name ?? '';
  const userEmail = session?.user?.email ?? '';

  const value = useMemo<RentContextValue>(
    () => ({
      mounted,
      lang,
      t,
      handleLangToggle,
      triggerToast,
      activeRole,
      roleId,
      isSuperAdmin,
      userName,
      userEmail,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mounted, lang, activeRole, roleId, isSuperAdmin, userName, userEmail]
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
