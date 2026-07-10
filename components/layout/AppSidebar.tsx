'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut, UserCircle, ShieldCheck, SlidersHorizontal } from 'lucide-react';
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
  const { t, lang, activeRole, isSuperAdmin, userName, userEmail } = useRent();
  const { setOpenMobile } = useSidebar();
  const can = useCan();

  const canAdmin = isSuperAdmin || can('admin.access');
  const roleLabel = activeRole || (lang === 'en' ? 'No role' : 'គ្មានតួនាទី');

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
            <span className="font-mono text-sm font-extrabold text-primary-foreground">P</span>
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-sans text-sm font-extrabold uppercase tracking-tight">
              {lang === 'en' ? 'Rental Invoice' : 'ប្រព័ន្ធគ្រប់គ្រងការជួល'}
            </h1>
            <p className="mt-0.5 block text-[9px] font-bold text-primary">
              Cambodia Real-Estate ($ / ៛)
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {lang === 'en' ? 'Navigation' : 'ម៉ឺនុយ'}
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
                      tooltip={t[item.labelKey]}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon
                          className={cn(isActive ? 'text-primary' : '')}
                        />
                        <span className="font-sans">{t[item.labelKey]}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {canAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {lang === 'en' ? 'Administration' : 'រដ្ឋបាល'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin/users'}
                    tooltip={lang === 'en' ? 'Users & Permissions' : 'អ្នកប្រើ និងសិទ្ធិ'}
                  >
                    <Link href="/admin/users" onClick={() => setOpenMobile(false)}>
                      <ShieldCheck
                        className={cn(pathname === '/admin/users' ? 'text-primary' : '')}
                      />
                      <span className="font-sans">{lang === 'en' ? 'Users' : 'អ្នកប្រើ'}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin/roles'}
                    tooltip={lang === 'en' ? 'Roles & Permissions' : 'តួនាទី និងសិទ្ធិ'}
                  >
                    <Link href="/admin/roles" onClick={() => setOpenMobile(false)}>
                      <SlidersHorizontal
                        className={cn(pathname === '/admin/roles' ? 'text-primary' : '')}
                      />
                      <span className="font-sans">
                        {lang === 'en' ? 'Roles & Permissions' : 'តួនាទី និងសិទ្ធិ'}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
            {lang === 'en' ? 'Sign out' : 'ចាកចេញ'}
          </Button>

          <div className="font-mono text-[8px] italic leading-tight text-muted-foreground">
            * Access is determined by your assigned role.
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
