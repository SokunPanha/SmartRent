'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { LogOut, UserCircle, ShieldCheck, SlidersHorizontal, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRent } from '@/store/rent-store';
import { useCan } from '@/features/admin/permissions.queries';
import { NAV_ITEMS } from './nav-config';

export function AppSidebar() {
  const pathname = usePathname();
  const { activeRole, isSuperAdmin, userName, userEmail } = useRent();
  const { setOpenMobile } = useSidebar();
  const can = useCan();
  const t = useTranslations('Common');

  const canAdmin = isSuperAdmin || can('admin.access');
  const canSettings = isSuperAdmin || can('admin.settings');
  const roleLabel = activeRole || t('no_role');

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
            <span className="font-mono text-sm font-extrabold text-primary-foreground">P</span>
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-sans text-sm font-extrabold uppercase tracking-tight">
              {t('rental_invoice_title')}
            </h1>
            <p className="mt-0.5 block text-[9px] font-bold text-primary">
              {t('real_estate_tagline')}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {t('navigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={t(item.labelKey)}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon
                          className={cn(isActive ? 'text-primary' : '')}
                        />
                        <span className="font-sans">{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(canAdmin || canSettings) && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {t('administration')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {canAdmin && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === '/admin/users'}
                        tooltip={t('users_permissions')}
                      >
                        <Link href="/admin/users" onClick={() => setOpenMobile(false)}>
                          <ShieldCheck
                            className={cn(pathname === '/admin/users' ? 'text-primary' : '')}
                          />
                          <span className="font-sans">{t('users')}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === '/admin/roles'}
                        tooltip={t('roles_permissions')}
                      >
                        <Link href="/admin/roles" onClick={() => setOpenMobile(false)}>
                          <SlidersHorizontal
                            className={cn(pathname === '/admin/roles' ? 'text-primary' : '')}
                          />
                          <span className="font-sans">
                            {t('roles_permissions')}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
                {canSettings && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/admin/settings'}
                      tooltip={t('system_settings')}
                    >
                      <Link href="/admin/settings" onClick={() => setOpenMobile(false)}>
                        <Settings
                          className={cn(pathname === '/admin/settings' ? 'text-primary' : '')}
                        />
                        <span className="font-sans">{t('system_settings')}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="space-y-2 p-2 font-sans">
          {/* Signed-in user */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
            <UserCircle className="h-7 w-7 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground">
                {userName || '—'}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">{userEmail}</p>
            </div>
            <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-primary">
              {roleLabel}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 font-bold"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('sign_out')}
          </Button>

          <div className="font-mono text-[8px] italic leading-tight text-muted-foreground">
            {t('access_note')}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
