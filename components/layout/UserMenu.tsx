'use client';

import { LogOut, UserCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRent } from '@/store/rent-store';
import { logout } from '@/features/auth/session.queries';

async function handleSignOut() {
  await logout();
  window.location.href = '/login';
}

/**
 * Profile avatar + sign-out menu in the header. This is the only sign-out
 * entry point on mobile now that the sidebar drawer is desktop-only — on
 * desktop it's a redundant (but harmless) second way to sign out alongside
 * the sidebar footer.
 */
export function UserMenu() {
  const { activeRole, userName, userEmail } = useRent();
  const t = useTranslations('Common');
  const roleLabel = activeRole || t('no_role');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_16px_-6px_var(--primary)] transition hover:bg-primary/90 cursor-pointer"
          aria-label={userName || t('users')}
        >
          <UserCircle className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-xs font-bold text-foreground">
              {userName || '—'}
            </span>
            <span className="truncate text-[10px] text-muted-foreground">{userEmail}</span>
            <span className="mt-1 inline-block w-fit rounded-md bg-primary/15 px-1.5 py-0.5 text-[11px] font-extrabold text-primary">
              {roleLabel}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => handleSignOut()}
        >
          <LogOut className="h-3.5 w-3.5" />
          {t('sign_out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
