'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LogOut, UserCircle, ShieldCheck, SlidersHorizontal, Settings, ChevronDown } from 'lucide-react';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useRent } from '@/store/rent-store';
import { useCan } from '@/features/admin/permissions.queries';
import { logout } from '@/features/auth/session.queries';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, isNavActive, activeChildHref } from './nav-config';

async function handleSignOut() {
  await logout();
  window.location.href = '/login';
}

/** Pastel Console nav item: roomy pill; the active route is a solid white
 *  (light-ink) pill on the dark charcoal sidebar. */
const NAV_BUTTON =
  'h-11 rounded-full px-4 gap-3 text-[15px] text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-active data-[active=true]:font-semibold data-[active=true]:text-sidebar-active-foreground data-[active=true]:shadow-[0_4px_14px_rgba(0,0,0,0.25)] [&_svg]:size-[18px]';
const GROUP_LABEL = 'px-4 text-[13px] font-medium text-sidebar-muted';
/** Sub-menu entry: smaller pill, same white active state. */
const SUB_BUTTON =
  'h-10 rounded-full px-3.5 gap-2.5 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-active data-[active=true]:font-semibold data-[active=true]:text-sidebar-active-foreground [&>svg]:size-4 [&>svg]:text-current';

export function AppSidebar() {
  const pathname = usePathname();
  const { activeRole, isSuperAdmin, userName, userEmail } = useRent();
  const { setOpenMobile } = useSidebar();
  const can = useCan();
  const t = useTranslations('Common');

  const canAdmin = isSuperAdmin || can('admin.access');
  const canSettings = isSuperAdmin || can('admin.settings');
  const roleLabel = activeRole || t('no_role');

  // Expandable groups open automatically on one of their pages; a manual
  // toggle (keyed by the group's label) overrides that.
  const [groupToggles, setGroupToggles] = useState<Record<string, boolean>>({});

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 pt-3 pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-[0_6px_18px_-4px_var(--primary)]">
            <span className="font-sans text-base font-extrabold text-primary-foreground">P</span>
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-sans text-[15px] font-bold tracking-tight text-sidebar-foreground">
              {t('rental_invoice_title')}
            </h1>
            <p className="mt-0.5 block truncate text-xs text-sidebar-muted">
              {t('real_estate_tagline')}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={GROUP_LABEL}>
            {t('navigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;

                if (item.children) {
                  const activeHref = activeChildHref(pathname, item.children);
                  const childActive = activeHref !== null;
                  const open = groupToggles[item.labelKey] ?? childActive;
                  return (
                    <SidebarMenuItem key={item.labelKey}>
                      <SidebarMenuButton
                        className={cn(NAV_BUTTON, 'h-auto min-h-11 py-2.5', childActive && 'font-semibold text-sidebar-foreground')}
                        tooltip={t(item.labelKey)}
                        aria-expanded={open}
                        onClick={() =>
                          setGroupToggles((g) => ({ ...g, [item.labelKey]: !open }))
                        }
                      >
                        <Icon />
                        <span className="font-sans">{t(item.labelKey)}</span>
                        <ChevronDown
                          className={cn(
                            'ml-auto !size-4 transition-transform duration-200',
                            open && 'rotate-180'
                          )}
                        />
                      </SidebarMenuButton>
                      {open && (
                        <SidebarMenuSub className="mx-0 mt-1 ml-6 gap-1 border-sidebar-border py-0.5 pr-0 pl-3">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  className={SUB_BUTTON}
                                  isActive={child.href === activeHref}
                                >
                                  <Link href={child.href} onClick={() => setOpenMobile(false)}>
                                    <ChildIcon />
                                    <span className="font-sans">{t(child.labelKey)}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                const isActive = isNavActive(pathname, item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      className={NAV_BUTTON}
                      asChild
                      isActive={isActive}
                      tooltip={t(item.labelKey)}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon />
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
            <SidebarGroupLabel className={GROUP_LABEL}>
              {t('administration')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {canAdmin && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={NAV_BUTTON}
                        asChild
                        isActive={pathname === '/admin/users'}
                        tooltip={t('users_permissions')}
                      >
                        <Link href="/admin/users" onClick={() => setOpenMobile(false)}>
                          <ShieldCheck />
                          <span className="font-sans">{t('users')}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={NAV_BUTTON}
                        asChild
                        isActive={pathname === '/admin/roles'}
                        tooltip={t('roles_permissions')}
                      >
                        <Link href="/admin/roles" onClick={() => setOpenMobile(false)}>
                          <SlidersHorizontal />
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
                      className={NAV_BUTTON}
                      asChild
                      isActive={pathname === '/admin/settings'}
                      tooltip={t('system_settings')}
                    >
                      <Link href="/admin/settings" onClick={() => setOpenMobile(false)}>
                        <Settings />
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

      <SidebarFooter>
        <div className="gradient-hero space-y-3 rounded-3xl p-4 font-sans shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
          {/* Signed-in user */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/25">
              <UserCircle className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {userName || '—'}
              </p>
              <p className="truncate text-[11px] text-white/70">{userEmail}</p>
            </div>
          </div>
          <span className="inline-block max-w-full truncate rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {roleLabel}
          </span>

          <Button
            size="sm"
            className="h-10 w-full gap-2 rounded-full bg-white font-semibold text-[#1B1C20] shadow-none hover:bg-white/90"
            onClick={() => handleSignOut()}
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('sign_out')}
          </Button>

          <div className="text-[10px] leading-snug text-white/60">
            {t('access_note')}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
