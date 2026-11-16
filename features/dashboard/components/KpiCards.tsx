import { Building2, Building, Coins, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatUSD, formatKHRFromUSD } from '@/lib/format';
import { cn } from '@/lib/utils';
import { DashboardStats } from '../dashboard.helpers';

const usd0 = (v: number) => formatUSD(v, 0);

/** Pastel metric tile (see `.tile*` in globals.css / DESIGN.md). */
function KpiTile({
  id,
  tone,
  icon: Icon,
  label,
  chip,
  onClick,
  children,
}: {
  id: string;
  tone: 'indigo' | 'green' | 'orange' | 'yellow';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  chip?: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={cn(
        'tile group flex min-h-40 cursor-pointer flex-col justify-between p-5 transition duration-200 hover:brightness-[0.98]',
        tone !== 'indigo' && `tile-${tone}`
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[15px] font-medium leading-tight">{label}</span>
        <span className="tile-icon size-9 shrink-0 shadow-sm transition group-hover:scale-105">
          <Icon className="size-[18px]" />
        </span>
      </div>
      <div className="mt-4">
        {children}
        {chip && <div className="mt-1.5 text-xs font-medium tile-muted">{chip}</div>}
      </div>
    </div>
  );
}

export function KpiCards({
  stats,
  onNavigate,
}: {
  stats: DashboardStats;
  onNavigate: (tab: string) => void;
}) {
  const t = useTranslations('Dashboard');
  const paidPct = Math.round(
    (stats.currentMonthRevenueCollected / (stats.currentMonthRevenueInvoiced || 1)) * 100
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-metric-cards-grid">
      <KpiTile
        id="kpi-properties"
        tone="indigo"
        icon={Building2}
        label={t('total_properties')}
        onClick={() => onNavigate('properties')}
        chip={
          <span className="inline-flex items-center gap-1">
            <ArrowUpRight className="size-3.5" />
            {stats.totalRooms} {t('total_rooms').toLowerCase()}
          </span>
        }
      >
        <span className="block text-3xl font-bold tracking-tight">{stats.totalProperties}</span>
      </KpiTile>

      <KpiTile
        id="kpi-rooms"
        tone="green"
        icon={Building}
        label={t('total_rooms')}
        onClick={() => onNavigate('properties')}
        chip={
          <>
            {stats.occupiedRooms}/{stats.totalRooms} {t('occ_short')} · {stats.vacantRooms}{' '}
            {t('vacant').toLowerCase()}
          </>
        }
      >
        <span className="block text-3xl font-bold tracking-tight">{stats.totalRooms}</span>
      </KpiTile>

      <KpiTile
        id="kpi-revenue"
        tone="yellow"
        icon={Coins}
        label={t('monthly_revenue', { month: t(`month_${new Date().getMonth() + 1}`) })}
        onClick={() => onNavigate('invoices')}
        chip={
          <>
            {paidPct}% {t('paid_short')} · ≈ {formatKHRFromUSD(stats.currentMonthRevenueInvoiced)}
          </>
        }
      >
        <span className="block text-3xl font-bold tracking-tight">
          {usd0(stats.currentMonthRevenueInvoiced)}
        </span>
      </KpiTile>

      <KpiTile
        id="kpi-outstanding"
        tone="orange"
        icon={AlertTriangle}
        label={t('outstanding_amount')}
        onClick={() => onNavigate('invoices')}
        chip={
          <>
            {stats.overdueCount > 0 && (
              <>
                {stats.overdueCount} {t('overdue_short')} ·{' '}
              </>
            )}
            ≈ {formatKHRFromUSD(stats.totalOutstanding)}
          </>
        }
      >
        <span className="block text-3xl font-bold tracking-tight">
          {usd0(stats.totalOutstanding)}
        </span>
      </KpiTile>
    </div>
  );
}
