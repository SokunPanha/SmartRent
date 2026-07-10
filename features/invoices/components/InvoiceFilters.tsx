import { Calculator } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { MonthOption } from '../invoices.helpers';

export function InvoiceFilters({
  activeMonths,
  selectedStatus,
  onSelectStatus,
  selectedMonth,
  onSelectMonth,
  canGenerate,
  onGenerate,
  t,
  lang,
}: {
  activeMonths: MonthOption[];
  selectedStatus: string;
  onSelectStatus: (s: string) => void;
  selectedMonth: string;
  onSelectMonth: (m: string) => void;
  canGenerate: boolean;
  onGenerate: () => void;
  t: any;
  lang: AppLanguage;
}) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-3xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{lang === 'en' ? 'Filter Status:' : 'ស្ថានភាព៖'}</span>
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">{lang === 'en' ? 'All Invoices' : 'គ្រប់វិក្កយបត្រទាំងអស់'}</option>
            <option value="paid">{t.paid}</option>
            <option value="unpaid">{t.unpaid}</option>
            <option value="partial">{t.partial}</option>
            <option value="overdue">{t.overdue}</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{lang === 'en' ? 'Month:' : 'ខែ៖'}</span>
          <select
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">{lang === 'en' ? 'All Months' : 'គ្រប់ខែទាំងអស់'}</option>
            {activeMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {canGenerate && (
        <button
          onClick={onGenerate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-chart-2 text-white rounded-lg hover:bg-chart-2/90 transition cursor-pointer self-stretch md:self-auto justify-center"
          id="trigger-june-invoices-btn"
        >
          <Calculator className="w-4 h-4" />
          {t.generate_monthly_invoices}
        </button>
      )}
    </div>
  );
}
