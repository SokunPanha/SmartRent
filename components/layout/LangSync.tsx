'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function hasLocaleCookie(): boolean {
  return document.cookie.split('; ').some((c) => c.startsWith('locale='));
}

/**
 * Seeds the UI language from the signed-in user's `preferredLang` the first
 * time they arrive without an explicit `locale` cookie. Once the user toggles
 * language (which sets the cookie), this never overrides their choice.
 * Renders nothing.
 */
export function LangSync() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || status !== 'authenticated') return;
    done.current = true;
    const pref = session?.user?.preferredLang;
    if ((pref === 'en' || pref === 'km') && !hasLocaleCookie()) {
      document.cookie = `locale=${pref}; path=/; max-age=31536000`;
      router.refresh();
    }
  }, [status, session, router]);

  return null;
}
