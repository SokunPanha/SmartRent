'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Property,
  Room,
  Tenant,
  Contract,
  MeterReading,
  Invoice,
  ActivityLog,
  AppLanguage,
} from '@/lib/types';
import {
  getDashboardStats,
  getMonthlyRevenue,
  getOccupancyBreakdown,
} from './dashboard.helpers';
import { DashboardHeader } from './components/DashboardHeader';
import { KpiCards } from './components/KpiCards';
import { QuickActionsGrid } from './components/QuickActionsGrid';
import { DashboardDetails } from './components/DashboardDetails';

interface DashboardProps {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  contracts: Contract[];
  readings: MeterReading[];
  invoices: Invoice[];
  logs: ActivityLog[];
  lang: AppLanguage;
  onNavigate: (tab: string) => void;
}

/**
 * Dashboard feature entry point: computes derived data and composes the
 * presentational sub-components in `./components`.
 */
export default function Dashboard({
  properties,
  rooms,
  contracts,
  invoices,
  logs,
  lang,
  onNavigate,
}: DashboardProps) {
  const t = useTranslations('Dashboard');
  const stats = useMemo(
    () => getDashboardStats(properties, rooms, contracts, invoices),
    [properties, rooms, contracts, invoices]
  );
  const revenue = useMemo(() => getMonthlyRevenue(invoices, t), [invoices, t]);
  const { occupiedPct, vacantPct, maintPct } = getOccupancyBreakdown(stats);

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmountUSD, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaidUSD, 0);
  const collectionPercent =
    totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return (
    <div className="space-y-6 text-foreground" id="dashboard-tab-content">
      <DashboardHeader onNavigate={onNavigate} />
      <KpiCards stats={stats} onNavigate={onNavigate} />
      <QuickActionsGrid onNavigate={onNavigate} />

      {/* Mobile home stays to headline numbers only; the same detail view
          is reachable there via the "Statistics" grid tile at /statistics. */}
      <div className="hidden md:block">
        <DashboardDetails
          stats={stats}
          revenue={revenue}
          occupiedPct={occupiedPct}
          vacantPct={vacantPct}
          maintPct={maintPct}
          collectionPercent={collectionPercent}
          totalCollected={totalCollected}
          logs={logs}
          lang={lang}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
