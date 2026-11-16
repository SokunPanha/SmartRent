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
    <div className="gradient-hero flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-(--radius-card) shadow-[0_14px_34px_-14px_var(--primary)]">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-sans">
          <Building2 className="w-5 h-5 text-white" />
          {t('dashboard_summary')}
        </h2>
        <p className="text-sm text-white/75 mt-1">
          {t('current_date_label')}
          <span className="font-semibold text-white">{todayLabel}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onNavigate('invoices')}
          id="quick-generator-btn"
          className="flex h-11 items-center gap-1.5 px-5 text-sm font-semibold bg-white text-[#1B1C20] rounded-full hover:bg-white/90 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('generate_monthly_invoices')}
        </button>
      </div>
    </div>
  );
}
