'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/** Accent themes are orthogonal to next-themes' light/dark. They swap only the
 *  signature accent tokens via a `data-accent` attribute on <html> (see
 *  globals.css). All three are bold, saturated colors, never soft. */
export type Accent = 'red' | 'navy' | 'amethyst';

export const ACCENT_STORAGE_KEY = 'tt-accent';
export const DEFAULT_ACCENT: Accent = 'red';

/** `labelKey` resolves against the `Common` message namespace; `swatch` is the
 *  representative dot shown in the picker (matches the light-mode primary). */
export const ACCENTS: { id: Accent; labelKey: string; swatch: string }[] = [
  { id: 'red', labelKey: 'theme_crimson', swatch: '#EC2028' },
  { id: 'navy', labelKey: 'theme_navy', swatch: '#1E3A8A' },
  { id: 'amethyst', labelKey: 'theme_amethyst', swatch: '#6D28D9' },
];

export function isAccent(v: unknown): v is Accent {
  return v === 'red' || v === 'navy' || v === 'amethyst';
}

type AccentContextValue = { accent: Accent; setAccent: (a: Accent) => void };
const AccentContext = createContext<AccentContextValue | null>(null);

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>(DEFAULT_ACCENT);

  // Sync React state with whatever the pre-paint script already applied to
  // <html>, so the picker's active check mark is correct after hydration.
  useEffect(() => {
    const applied = document.documentElement.getAttribute('data-accent');
    if (isAccent(applied)) setAccentState(applied);
  }, []);

  const setAccent = useCallback((next: Accent) => {
    setAccentState(next);
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
