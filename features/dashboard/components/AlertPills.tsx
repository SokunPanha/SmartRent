import { XCircle, Calendar } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { DashboardStats } from '../dashboard.helpers';

export function AlertPills({
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Overdue Invoices */}
      <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-destructive font-bold uppercase tracking-wider font-mono">
              {t.overdue_invoices}
            </p>
            <p className="text-sm text-destructive font-bold mt-0.5">
              {stats.overdueCount}{' '}
              {lang === 'en'
                ? 'Invoices Require Collection Action'
                : 'វិក្កយបត្រត្រូវការប្រមូលប្រាក់បន្ទាន់'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('invoices')}
          className="text-xs font-bold text-destructive hover:text-destructive transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          {lang === 'en' ? 'Collect Now' : 'ប្រមូលប្រាក់ទូទាត់'} →
        </button>
      </div>

      {/* Contracts Expiring Soon */}
      <div className="bg-chart-1/5 border border-chart-1/15 rounded-xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-chart-1/10 text-chart-1 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-chart-1 font-bold uppercase tracking-wider font-mono">
              {t.contracts_expiring}
            </p>
            <p className="text-sm text-chart-1 font-bold mt-0.5">
              {stats.contractsExpiringSoon}{' '}
              {lang === 'en'
                ? 'Active Contracts Expiring Soon'
                : 'កិច្ចសន្យាសកម្មដែលជិតផុតកំណត់'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('tenants')}
          className="text-xs font-bold text-chart-1 hover:text-chart-1 transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          {lang === 'en' ? 'View/Renew' : 'មើល/បន្តកុងត្រា'} →
        </button>
      </div>
    </div>
  );
}
