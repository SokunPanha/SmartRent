import {
  Building2,
  Building,
  Users,
  Lightbulb,
  FileText,
  BarChart3,
  UserRound,
  FileSignature,
  DoorOpen,
  Wallet,
  Send,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  /** Route segment this item links to. */
  href: string;
  /** Key in the "Common" next-intl namespace used for the label. */
  labelKey: string;
  icon: LucideIcon;
  /** Sub-menu pages. When present the sidebar shows this item as an
   *  expandable group; `href` is then the group's landing page. */
  children?: NavItem[];
}

/** True when `pathname` is `href` or one of its nested pages
 *  (e.g. /tenants/abc counts as /tenants). */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

/** The single sub-menu entry to highlight: the longest matching href, so
 *  /invoices/telegram lights up "Telegram delivery", not "Invoices". */
export function activeChildHref(pathname: string, children: NavItem[]): string | null {
  const matches = children.filter((c) => isNavActive(pathname, c.href));
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (b.href.length > a.href.length ? b : a)).href;
}

/** Flattens groups into their leaf pages (used by the mobile shortcut grid). */
export function flatNavItems(items: NavItem[] = NAV_ITEMS): NavItem[] {
  return items.flatMap((item) => item.children ?? [item]);
}

/**
 * Single source of truth for primary navigation. Each entry maps a route to a
 * translated label + icon, consumed by the sidebar.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'tab_dashboard', icon: Building2 },
  {
    href: '/properties',
    labelKey: 'tab_properties',
    icon: Building,
    children: [
      { href: '/properties', labelKey: 'nav_buildings', icon: Building },
      { href: '/rooms', labelKey: 'nav_all_rooms', icon: DoorOpen },
    ],
  },
  {
    href: '/tenants',
    labelKey: 'tab_tenants',
    icon: Users,
    children: [
      { href: '/tenants', labelKey: 'nav_tenants', icon: UserRound },
      { href: '/contracts', labelKey: 'nav_contracts', icon: FileSignature },
    ],
  },
  { href: '/utilities', labelKey: 'tab_utilities', icon: Lightbulb },
  {
    href: '/invoices',
    labelKey: 'tab_invoices',
    icon: FileText,
    children: [
      { href: '/invoices', labelKey: 'nav_invoices', icon: FileText },
      { href: '/invoices/telegram', labelKey: 'nav_telegram_delivery', icon: Send },
    ],
  },
  {
    href: '/reports',
    labelKey: 'tab_reports',
    icon: BarChart3,
    children: [
      { href: '/reports', labelKey: 'nav_reports', icon: BarChart3 },
      { href: '/expenses', labelKey: 'nav_expenses', icon: Wallet },
    ],
  },
];
