import { Building2, Plus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export function DashboardHeader({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const todayLabel = new Date().toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <div className="gradient-hero flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-2xl shadow-lg">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-sans">
          <Building2 className="w-5 h-5 text-white" />
          {t('dashboard_summary')}
        </h2>
        <p className="text-xs text-white/70 font-mono mt-0.5">
          {t('current_date_label')}
          <span className="font-semibold text-white">{todayLabel}</span>
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
