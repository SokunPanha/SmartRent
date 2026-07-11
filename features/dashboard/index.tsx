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
import { AlertPills } from './components/AlertPills';
import { RevenueChart } from './components/RevenueChart';
import { OccupancyChart } from './components/OccupancyChart';
import { CollectionGauge } from './components/CollectionGauge';
import { UtilityChart } from './components/UtilityChart';
import { RecentActivity } from './components/RecentActivity';

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
      <AlertPills stats={stats} lang={lang} onNavigate={onNavigate} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-grid">
        <RevenueChart data={revenue} />
        <OccupancyChart
          stats={stats}
          occupiedPct={occupiedPct}
          vacantPct={vacantPct}
          maintPct={maintPct}
        />
        <CollectionGauge
          percent={collectionPercent}
          collected={totalCollected}
          outstanding={stats.totalOutstanding}
        />
        <UtilityChart />
      </div>

      <RecentActivity logs={logs} lang={lang} />
    </div>
  );
}
