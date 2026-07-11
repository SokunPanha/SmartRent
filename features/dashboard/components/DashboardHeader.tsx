import { Building2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DashboardHeader({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const t = useTranslations('Dashboard');
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 p-5 rounded-2xl border border-border shadow-lg">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2 font-sans">
          <Building2 className="w-5 h-5 text-primary" />
          {t('dashboard_summary')}
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          {t('simulation_active_date')}
          <span className="font-semibold text-primary">June 15, 2026</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onNavigate('invoices')}
          id="quick-generator-btn"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/10"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('generate_monthly_invoices')}
        </button>
      </div>
    </div>
  );
}
