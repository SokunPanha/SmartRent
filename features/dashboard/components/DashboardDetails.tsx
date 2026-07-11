import { ActivityLog, AppLanguage } from '@/lib/types';
import { DashboardStats, MonthlyRevenuePoint } from '../dashboard.helpers';
import { AlertPills } from './AlertPills';
import { RevenueChart } from './RevenueChart';
import { OccupancyChart } from './OccupancyChart';
import { CollectionGauge } from './CollectionGauge';
import { UtilityChart } from './UtilityChart';
import { RecentActivity } from './RecentActivity';

/**
 * The heavier analytics section of the dashboard (alerts, charts, activity
 * log) — shown inline on desktop, and behind the "Statistics" grid tile on
 * mobile so the phone home screen can stay to just the headline numbers.
 */
export function DashboardDetails({
  stats,
  revenue,
  occupiedPct,
  vacantPct,
  maintPct,
  collectionPercent,
  totalCollected,
  logs,
  lang,
  onNavigate,
}: {
  stats: DashboardStats;
  revenue: MonthlyRevenuePoint[];
  occupiedPct: number;
  vacantPct: number;
  maintPct: number;
  collectionPercent: number;
  totalCollected: number;
  logs: ActivityLog[];
  lang: AppLanguage;
  onNavigate: (tab: string) => void;
}) {
  return (
    <div className="space-y-6">
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
