'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

/**
 * Login logic, decoupled from presentation. Owns the form fields, the
 * credentials sign-in call and the post-login redirect. UI components consume
 * this and stay purely presentational.
 */
export function useLogin() {
  const router = useRouter();
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

    const res = await signIn('credentials', { email, password, redirect: false });

    setLoading(false);

    if (res?.error) {
      setError(t('invalid_credentials'));
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return { email, setEmail, password, setPassword, error, loading, submit };
}
