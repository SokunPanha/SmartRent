import { Building2, Building, Coins, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatUSD, formatKHRFromUSD } from '@/lib/format';
import { DashboardStats } from '../dashboard.helpers';

const usd0 = (v: number) => formatUSD(v, 0);

export function KpiCards({
  stats,
  onNavigate,
}: {
  stats: DashboardStats;
  onNavigate: (tab: string) => void;
}) {
  const t = useTranslations('Dashboard');
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-metric-cards-grid">
      {/* KPI: Total Properties */}
      <div
        onClick={() => onNavigate('properties')}
        className="bg-card p-5 rounded-2xl border border-border shadow-card hover:border-primary/30 transition duration-200 cursor-pointer group"
        id="kpi-properties"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-105 transition">
            <Building2 className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
        </div>
        <div className="mt-3">
          <span className="text-xs font-medium text-muted-foreground block">
            {t('total_properties')}
          </span>
          <span className="text-2xl font-bold text-foreground tracking-tight font-sans">
            {stats.totalProperties}
          </span>
        </div>
      </div>

      {/* KPI: Total Rooms */}
      <div
        onClick={() => onNavigate('properties')}
        className="bg-card p-5 rounded-2xl border border-border shadow-card hover:border-primary/30 transition duration-200 cursor-pointer group"
        id="kpi-rooms"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-info/10 rounded-xl text-info group-hover:scale-105 transition">
            <Building className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold bg-info/10 text-info px-2 py-0.5 rounded-full border border-info/20">
            {stats.occupiedRooms}/{stats.totalRooms} {t('occ_short')}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-xs font-medium text-muted-foreground block">
            {t('total_rooms')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tracking-tight font-sans">
              {stats.totalRooms}
            </span>
            <span className="text-xs text-muted-foreground">
              ({stats.vacantRooms} {t('vacant').toLowerCase()})
            </span>
          </div>
        </div>
      </div>

      {/* KPI: Rent Revenue (current month) */}
      <div
        onClick={() => onNavigate('invoices')}
        className="bg-card p-5 rounded-2xl border border-border shadow-card hover:border-primary/30 transition duration-200 cursor-pointer group"
        id="kpi-revenue"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-chart-2/10 rounded-xl text-chart-2 group-hover:scale-105 transition">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold bg-chart-2/10 text-chart-2 px-2 py-0.5 rounded-full border border-chart-2/20">
            {Math.round((stats.currentMonthRevenueCollected / (stats.currentMonthRevenueInvoiced || 1)) * 100)}%{' '}
            {t('paid_short')}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-xs font-medium text-muted-foreground block">
            {t('monthly_revenue')}
          </span>
          <span className="text-2xl font-bold text-foreground tracking-tight block">
            {usd0(stats.currentMonthRevenueInvoiced)}
          </span>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            ≈ {formatKHRFromUSD(stats.currentMonthRevenueInvoiced)}
          </span>
        </div>
      </div>

      {/* KPI: Outstanding Amount */}
      <div
        onClick={() => onNavigate('invoices')}
        className="bg-card p-5 rounded-2xl border border-border shadow-card hover:border-primary/30 transition duration-200 cursor-pointer group"
        id="kpi-outstanding"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-destructive/10 rounded-xl text-destructive group-hover:scale-105 transition">
            <AlertTriangle className="w-5 h-5" />
          </div>
          {stats.overdueCount > 0 && (
            <span className="text-[11px] font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full border border-destructive/20">
              {stats.overdueCount} {t('overdue_short')}
            </span>
          )}
        </div>
        <div className="mt-3">
          <span className="text-xs font-medium text-muted-foreground block">
            {t('outstanding_amount')}
          </span>
          <span className="text-2xl font-bold text-destructive tracking-tight block">
            {usd0(stats.totalOutstanding)}
          </span>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            ≈ {formatKHRFromUSD(stats.totalOutstanding)}
          </span>
        </div>
      </div>
    </div>
  );
}
