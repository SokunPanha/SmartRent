import { Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppLanguage } from '@/lib/types';
import { Pagination, usePagination } from '@/components/shared/Pagination';
import { MonthlySummaryRow } from '../reports.helpers';

export function MonthlyTable({
  rows,
  lang,
}: {
  rows: MonthlySummaryRow[];
  lang: AppLanguage;
}) {
  const t = useTranslations('Reports');
  const { page, totalPages, pageRows, setPage, pageSize } = usePagination(rows);
  return (
    <div className="lg:col-span-12 bg-card rounded-(--radius-card) border border-border overflow-hidden">
      <div className="p-4 bg-muted border-b border-border">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-sans dark:font-mono">
          {t('monthly_statement_title')}
        </h4>
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[55vh] scroll-x-hint">
        <table className="w-full text-left text-xs text-muted-foreground">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted border-b border-border text-[10px] font-bold text-muted-foreground uppercase font-sans dark:font-mono">
              <th className="p-4 pl-6">{t('billed_cycle')}</th>
              <th className="p-4 text-right">{t('rent_revenue')}</th>
              <th className="p-4 text-right">
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Elect Cost (USD)
                </span>
              </th>
              <th className="p-4 text-right">
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Water Cost (USD)
                </span>
              </th>
              <th className="p-4 text-right">{t('aggregate_billed')}</th>
              <th className="p-4 text-right text-chart-2 font-bold">
                {t('deposited_receipts')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono text-foreground">
            {pageRows.map((row) => (
              <tr key={row.month} className="hover:bg-muted/50 transition">
                <td className="p-4 pl-6 font-bold text-foreground font-sans">{row.monthLabel}</td>
                <td className="p-4 text-right">${row.rent.toFixed(2)}</td>
                <td className="p-4 text-right text-chart-1">${row.electricity.toFixed(2)}</td>
                <td className="p-4 text-right text-info">${row.water.toFixed(2)}</td>
                <td className="p-4 text-right font-bold text-foreground">${row.total.toFixed(2)}</td>
                <td className="p-4 text-right font-black text-chart-2 bg-chart-2/10">
                  ${row.collected.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={rows.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
