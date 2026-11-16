import { useTranslations } from 'next-intl';
import { AppLanguage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MonthlySummaryRow } from '../reports.helpers';

const usd = (v: number) => `$${v.toFixed(2)}`;

/** Twelve months of the selected year: what was billed, what was actually
 *  received (by payment date), expenses and net. */
export function MonthlyTable({ rows }: { rows: MonthlySummaryRow[]; lang: AppLanguage }) {
  const t = useTranslations('Reports');
  const sum = (k: keyof MonthlySummaryRow) => rows.reduce((s, r) => s + (r[k] as number), 0);
  return (
    <div className="lg:col-span-12 overflow-hidden rounded-(--radius-card) border border-(--card-border) bg-card shadow-card">
      <div className="border-b border-border p-4 md:px-5">
        <h4 className="text-base font-semibold text-foreground">{t('monthly_statement_title')}</h4>
        <p className="mt-0.5 text-xs text-muted-foreground">{t('monthly_statement_note')}</p>
      </div>
      <div className="scroll-x-hint overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="p-3 pl-5 font-semibold">{t('billed_cycle')}</th>
              <th className="p-3 text-right font-semibold">{t('rent_revenue')}</th>
              <th className="p-3 text-right font-semibold">{t('electricity_col')}</th>
              <th className="p-3 text-right font-semibold">{t('water_col')}</th>
              <th className="p-3 text-right font-semibold">{t('fees_col')}</th>
              <th className="p-3 text-right font-semibold">{t('aggregate_billed')}</th>
              <th className="p-3 text-right font-semibold text-chart-2">{t('cash_received')}</th>
              <th className="p-3 text-right font-semibold">{t('expenses_total')}</th>
              <th className="p-3 pr-5 text-right font-semibold">{t('net_col')}</th>
            </tr>
          </thead>
          <tbody className="font-mono text-foreground">
            {rows.map((row) => (
              <tr key={row.month} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                <td className="p-3 pl-5 font-sans font-semibold">{row.monthLabel}</td>
                <td className="p-3 text-right">{usd(row.rent)}</td>
                <td className="p-3 text-right">{usd(row.electricity)}</td>
                <td className="p-3 text-right">{usd(row.water)}</td>
                <td className="p-3 text-right">{usd(row.fees)}</td>
                <td className="p-3 text-right font-semibold">{usd(row.total)}</td>
                <td className="p-3 text-right font-semibold text-chart-2">{usd(row.received)}</td>
                <td className="p-3 text-right">{usd(row.expenses)}</td>
                <td className={cn('p-3 pr-5 text-right font-bold', row.net < 0 && 'text-destructive')}>{usd(row.net)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-mono">
            <tr className="border-t-2 border-border bg-muted/40 font-bold">
              <td className="p-3 pl-5 font-sans">{t('year_total')}</td>
              <td className="p-3 text-right">{usd(sum('rent'))}</td>
              <td className="p-3 text-right">{usd(sum('electricity'))}</td>
              <td className="p-3 text-right">{usd(sum('water'))}</td>
              <td className="p-3 text-right">{usd(sum('fees'))}</td>
              <td className="p-3 text-right">{usd(sum('total'))}</td>
              <td className="p-3 text-right text-chart-2">{usd(sum('received'))}</td>
              <td className="p-3 text-right">{usd(sum('expenses'))}</td>
              <td className={cn('p-3 pr-5 text-right', sum('net') < 0 && 'text-destructive')}>{usd(sum('net'))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
