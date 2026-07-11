import { useTranslations } from 'next-intl';
import { Calculator } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonthOption } from '../invoices.helpers';

export function InvoiceFilters({
  activeMonths,
  selectedStatus,
  onSelectStatus,
  selectedMonth,
  onSelectMonth,
  canGenerate,
  onGenerate,
  lang,
}: {
  activeMonths: MonthOption[];
  selectedStatus: string;
  onSelectStatus: (s: string) => void;
  selectedMonth: string;
  onSelectMonth: (m: string) => void;
  canGenerate: boolean;
  onGenerate: () => void;
  lang: AppLanguage;
}) {
  const t = useTranslations('Invoices');
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-3xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{t('filter_status')}</span>
          <Select value={selectedStatus} onValueChange={onSelectStatus}>
            <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_invoices')}</SelectItem>
              <SelectItem value="paid">{t('paid')}</SelectItem>
              <SelectItem value="unpaid">{t('unpaid')}</SelectItem>
              <SelectItem value="partial">{t('partial')}</SelectItem>
              <SelectItem value="overdue">{t('overdue')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{t('month_label')}</span>
          <Select value={selectedMonth} onValueChange={onSelectMonth}>
            <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_months')}</SelectItem>
              {activeMonths.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {canGenerate && (
        <button
          onClick={onGenerate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-chart-2 text-white rounded-lg hover:bg-chart-2/90 transition cursor-pointer self-stretch md:self-auto justify-center"
          id="trigger-june-invoices-btn"
        >
          <Calculator className="w-4 h-4" />
          {t('generate_monthly_invoices')}
        </button>
      )}
    </div>
  );
}
