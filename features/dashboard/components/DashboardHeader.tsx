import { Building2, Plus } from 'lucide-react';
import { AppLanguage } from '@/lib/types';

export function DashboardHeader({
  t,
  lang,
  onNavigate,
}: {
  t: any;
  lang: AppLanguage;
  onNavigate: (tab: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 p-5 rounded-2xl border border-border shadow-lg">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2 font-sans">
          <Building2 className="w-5 h-5 text-indigo-400" />
          {t.dashboard_summary}
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          {lang === 'en' ? 'Simulation active date: ' : 'កាលបរិច្ឆេទសាកល្បង៖ '}
          <span className="font-semibold text-indigo-400">June 15, 2026</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onNavigate('invoices')}
          id="quick-generator-btn"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-750 transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.generate_monthly_invoices}
        </button>
      </div>
    </div>
  );
}
