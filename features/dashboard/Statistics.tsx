'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Activity } from 'lucide-react';
import { Property, Room, Contract, Invoice, ActivityLog, AppLanguage } from '@/lib/types';
import { getDashboardStats, getMonthlyRevenue, getOccupancyBreakdown } from './dashboard.helpers';
import { DashboardDetails } from './components/DashboardDetails';

interface StatisticsProps {
  properties: Property[];
  rooms: Room[];
  contracts: Contract[];
  invoices: Invoice[];
  logs: ActivityLog[];
  lang: AppLanguage;
  onNavigate: (tab: string) => void;
}

/**
 * Mobile-only counterpart to the dashboard's inline analytics: the same
 * `DashboardDetails` section (alerts, charts, activity log), reached via the
 * "Statistics" tile in the home grid instead of scrolling the phone's home
 * screen. Desktop never links here — it already shows this content inline
 * on /dashboard.
 */
export default function Statistics({
  properties,
  rooms,
  contracts,
  invoices,
  logs,
  lang,
  onNavigate,
}: StatisticsProps) {
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
    <div className="space-y-6 text-foreground" id="statistics-tab-content">
      <div className="gradient-hero flex items-center gap-2 p-4 rounded-xl shadow-lg">
        <Activity className="w-5 h-5 text-white" />
        <h2 className="font-sans text-base font-bold tracking-tight text-white">
          {t('statistics_title')}
        </h2>
      </div>

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
  );
}
