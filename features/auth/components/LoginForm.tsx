'use client';

import { Loader2, Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLogin } from '../use-login';

/** Presentational sign-in card. All behaviour lives in `useLogin`. */
export function LoginForm() {
  const { email, setEmail, password, setPassword, error, loading, submit } = useLogin();
  const t = useTranslations('Auth');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg font-extrabold uppercase tracking-tight">
              {t('app_title')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('app_subtitle')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-muted-foreground">
                {t('email_label')}
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t('email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-muted-foreground">
                {t('password_label')}
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full font-bold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t('signing_in')}
                </>
              ) : (
                t('sign_in')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
