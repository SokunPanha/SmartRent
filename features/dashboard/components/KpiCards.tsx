import { Building2, Building, Coins, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { formatUSD, formatKHRFromUSD } from '@/lib/format';
import { DashboardStats } from '../dashboard.helpers';

const usd0 = (v: number) => formatUSD(v, 0);

export function KpiCards({
  stats,
  t,
  lang,
  onNavigate,
}: {
  stats: DashboardStats;
  t: any;
  lang: AppLanguage;
  onNavigate: (tab: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-metric-cards-grid">
      {/* KPI: Total Properties */}
      <div
        onClick={() => onNavigate('properties')}
        className="bg-card/40 p-5 rounded-2xl border border-border shadow-md hover:border-border hover:bg-card/60 transition duration-200 cursor-pointer group"
        id="kpi-properties"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-105 transition">
            <Building2 className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground text-muted-foreground group-hover:text-indigo-400 transition" />
        </div>
        <div className="mt-3">
          <span className="text-[10px] font-bold text-muted-foreground block tracking-wider uppercase font-mono">
            {t.total_properties}
          </span>
          <span className="text-2xl font-bold text-foreground tracking-tight font-sans">
            {stats.totalProperties}
          </span>
        </div>
      </div>

      {/* KPI: Total Rooms */}
      <div
        onClick={() => onNavigate('properties')}
        className="bg-card/40 p-5 rounded-2xl border border-border shadow-md hover:border-border hover:bg-card/60 transition duration-200 cursor-pointer group"
        id="kpi-rooms"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-105 transition">
            <Building className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-mono">
            {stats.occupiedRooms}/{stats.totalRooms} {lang === 'en' ? 'Occ' : 'ជួល'}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-[10px] font-bold text-muted-foreground block tracking-wider uppercase font-mono">
            {t.total_rooms}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tracking-tight font-sans">
              {stats.totalRooms}
            </span>
            <span className="text-xs text-muted-foreground">
              ({stats.vacantRooms} {t.vacant.toLowerCase()})
            </span>
          </div>
        </div>
      </div>

      {/* KPI: Rent Revenue June */}
      <div
        onClick={() => onNavigate('invoices')}
        className="bg-card/40 p-5 rounded-2xl border border-border shadow-md hover:border-border hover:bg-card/60 transition duration-200 cursor-pointer group"
        id="kpi-revenue"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-105 transition">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
            {Math.round((stats.juneRevenueCollected / (stats.juneRevenueInvoiced || 1)) * 100)}%{' '}
            {lang === 'en' ? 'Paid' : 'រួច'}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-[10px] font-bold text-muted-foreground block tracking-wider uppercase font-mono">
            {t.monthly_revenue}
          </span>
          <span className="text-2xl font-bold text-foreground tracking-tight block">
            {usd0(stats.juneRevenueInvoiced)}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
            ≈ {formatKHRFromUSD(stats.juneRevenueInvoiced)}
          </span>
        </div>
      </div>

      {/* KPI: Outstanding Amount */}
      <div
        onClick={() => onNavigate('invoices')}
        className="bg-card/40 p-5 rounded-2xl border border-border shadow-md hover:border-border hover:bg-card/60 transition duration-200 cursor-pointer group"
        id="kpi-outstanding"
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-450 group-hover:scale-105 transition text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          {stats.overdueCount > 0 && (
            <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20 font-mono">
              {stats.overdueCount} {lang === 'en' ? 'Overdue' : 'ហួសកំណត់'}
            </span>
          )}
        </div>
        <div className="mt-3">
          <span className="text-[10px] font-bold text-muted-foreground block tracking-wider uppercase font-mono">
            {t.outstanding_amount}
          </span>
          <span className="text-2xl font-bold text-rose-400 tracking-tight block">
            {usd0(stats.totalOutstanding)}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
            ≈ {formatKHRFromUSD(stats.totalOutstanding)}
          </span>
        </div>
      </div>
    </div>
  );
}
