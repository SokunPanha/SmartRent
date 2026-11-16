import { XCircle, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppLanguage } from '@/lib/types';
import { DashboardStats } from '../dashboard.helpers';

export function AlertPills({
  stats,
  lang,
  onNavigate,
}: {
  stats: DashboardStats;
  lang: AppLanguage;
  onNavigate: (tab: string) => void;
}) {
  const t = useTranslations('Dashboard');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Overdue Invoices */}
      <div className="bg-card border border-(--card-border) shadow-card rounded-(--radius-card) p-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center bg-destructive/12 text-destructive rounded-full">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {t('overdue_invoices')}
            </p>
            <p className="text-sm text-foreground font-semibold mt-0.5">
              {stats.overdueCount} {t('overdue_invoices_desc')}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('invoices')}
          className="shrink-0 rounded-full bg-destructive/12 px-4.5 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          {t('collect_now')} →
        </button>
      </div>

      {/* Contracts Expiring Soon */}
      <div className="bg-card border border-(--card-border) shadow-card rounded-(--radius-card) p-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center bg-chart-1/12 text-chart-1 rounded-full">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {t('contracts_expiring')}
            </p>
            <p className="text-sm text-foreground font-semibold mt-0.5">
              {stats.contractsExpiringSoon} {t('contracts_expiring_desc')}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('contracts')}
          className="shrink-0 rounded-full bg-chart-1/15 px-4.5 py-2.5 text-xs font-semibold text-[#94690A] dark:text-chart-1 hover:bg-chart-1/25 transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          {t('view_renew')} →
        </button>
      </div>
    </div>
  );
}
