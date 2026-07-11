import { useTranslations } from 'next-intl';
import { Activity, ShieldCheck, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { useRent } from '@/store/rent-store';
import { useCan } from '@/features/admin/permissions.queries';
import { NAV_ITEMS } from '@/components/layout/nav-config';

interface ActionItem {
  tab: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Mobile-only shortcut grid shown on the dashboard home screen, mirroring
 * the icon-grid "quick actions" pattern common in Cambodian banking apps
 * (e.g. ABA Mobile) rather than relying on the sidebar drawer. Desktop
 * keeps the sidebar as the only nav surface, so this is hidden at `md`+.
 */
export function QuickActionsGrid({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const t = useTranslations('Common');
  const { isSuperAdmin } = useRent();
  const can = useCan();
  const canAdmin = isSuperAdmin || can('admin.access');

  const items: ActionItem[] = NAV_ITEMS.filter((item) => item.href !== '/dashboard').map(
    (item) => ({
      tab: item.href.slice(1),
      label: t(item.labelKey),
      icon: item.icon,
    })
  );

  items.push({ tab: 'statistics', label: t('statistics'), icon: Activity });

  if (canAdmin) {
    items.push(
      { tab: 'admin/users', label: t('users'), icon: ShieldCheck },
      { tab: 'admin/roles', label: t('roles_permissions'), icon: SlidersHorizontal }
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 md:hidden" id="dashboard-quick-actions-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.tab}
            onClick={() => onNavigate(item.tab)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-3xs transition hover:border-primary/30 cursor-pointer"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-sans text-[11px] font-semibold leading-tight text-foreground">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
