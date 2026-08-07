'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { login } from './session.queries';

/**
 * Login logic, decoupled from presentation. Owns the form fields, the
 * credentials sign-in call and the post-login redirect. UI components consume
 * this and stay purely presentational.
 *
 * The session cookie is set by the NestJS backend (via the Next.js /api/*
 * proxy), and client-side session state lives in TanStack Query
 * (features/auth/session.queries.ts) — a full navigation on success ensures
 * that cache starts fresh under the new cookie rather than trying to
 * invalidate it from here.
 */
export function useLogin() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const t = useTranslations('Auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch {
      setLoading(false);
      setError(t('invalid_credentials'));
      return;
    }

    window.location.href = callbackUrl;
  }

  return { email, setEmail, password, setPassword, error, loading, submit };
}
