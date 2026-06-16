import {
  Building2,
  Building,
  Users,
  Lightbulb,
  FileText,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { TRANSLATIONS } from '@/lib/data';

type TranslationKey = keyof (typeof TRANSLATIONS)['en'];

export interface NavItem {
  /** Route segment this item links to. */
  href: string;
  /** Translation key used for the label in the active language. */
  labelKey: TranslationKey;
  icon: LucideIcon;
}

/**
 * Single source of truth for primary navigation. Each entry maps a route to a
 * translated label + icon, consumed by the sidebar.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'tab_dashboard', icon: Building2 },
  { href: '/properties', labelKey: 'tab_properties', icon: Building },
  { href: '/tenants', labelKey: 'tab_tenants', icon: Users },
  { href: '/utilities', labelKey: 'tab_utilities', icon: Lightbulb },
  { href: '/invoices', labelKey: 'tab_invoices', icon: FileText },
  { href: '/reports', labelKey: 'tab_reports', icon: BarChart3 },
];
