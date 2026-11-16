'use client';

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

/** Accent themes are orthogonal to next-themes' light/dark. They swap only the
 *  signature accent tokens via a `data-accent` attribute on <html> (see
 *  globals.css). All are bold, saturated colors, never soft. Indigo is the
 *  default and lives in :root/.dark. */
export type Accent = 'indigo' | 'red' | 'navy' | 'amethyst';

/** Bumped from `tt-accent` with the Pastel Console redesign so everyone lands
 *  on the new indigo default once; later picks persist as usual. */
export const ACCENT_STORAGE_KEY = 'tt-accent-v2';
export const DEFAULT_ACCENT: Accent = 'indigo';

/** `labelKey` resolves against the `Common` message namespace; `swatch` is the
 *  representative dot shown in the picker (matches the light-mode primary). */
export const ACCENTS: { id: Accent; labelKey: string; swatch: string }[] = [
  { id: 'indigo', labelKey: 'theme_indigo', swatch: '#4F5BEF' },
  { id: 'red', labelKey: 'theme_crimson', swatch: '#EC2028' },
  { id: 'navy', labelKey: 'theme_navy', swatch: '#1E3A8A' },
  { id: 'amethyst', labelKey: 'theme_amethyst', swatch: '#6D28D9' },
];

export function isAccent(v: unknown): v is Accent {
  return v === 'indigo' || v === 'red' || v === 'navy' || v === 'amethyst';
}

function readAccent(): Accent {
  const applied = document.documentElement.getAttribute('data-accent');
  return isAccent(applied) ? applied : DEFAULT_ACCENT;
}

function subscribeAccent(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-accent'] });
  return () => observer.disconnect();
}

type AccentContextValue = { accent: Accent; setAccent: (a: Accent) => void };
const AccentContext = createContext<AccentContextValue | null>(null);

export function AccentProvider({ children }: { children: React.ReactNode }) {
  // The pre-paint script in app/layout.tsx sets data-accent on <html>; that
  // attribute is the source of truth, read via useSyncExternalStore.
  const accent = useSyncExternalStore(subscribeAccent, readAccent, () => DEFAULT_ACCENT);

  const setAccent = useCallback((next: Accent) => {
    document.documentElement.setAttribute('data-accent', next);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, next);
    } catch {
      /* private mode / storage disabled — attribute still applies for the session */
    }
  }, []);

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>
  );
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error('useAccent must be used within AccentProvider');
  return ctx;
}
