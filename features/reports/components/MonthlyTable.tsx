import { Layers } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { MonthlySummaryRow } from '../reports.helpers';

export function MonthlyTable({
  rows,
  lang,
}: {
  rows: MonthlySummaryRow[];
  lang: AppLanguage;
}) {
  return (
    <div className="lg:col-span-12 bg-card rounded-2xl border border-border overflow-hidden shadow-3xs">
      <div className="p-4 bg-muted border-b border-border">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-sans">
          {lang === 'en'
            ? 'MONTHLY INCOME STATEMENT SPECIFICATIONS'
            : 'របាយការណ៍ហិរញ្ញវត្ថុលម្អិតប្រចាំខែ'}
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-muted-foreground">
          <thead>
            <tr className="bg-muted border-b border-border text-[10px] font-bold text-muted-foreground uppercase font-sans">
              <th className="p-4 pl-6">{lang === 'en' ? 'Billed Cycle' : 'លំដាប់ខែ'}</th>
              <th className="p-4 text-right">{lang === 'en' ? 'Rent Revenue (USD)' : 'ចំណូលឈ្នួលផ្ទះ ($)'}</th>
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
              <th className="p-4 text-right">{lang === 'en' ? 'Aggregate Billed (USD)' : 'សរុបវិក្កយបត្រ ($)'}</th>
              <th className="p-4 text-right text-emerald-800 font-bold">
                {lang === 'en' ? 'Deposited Receipts (USD)' : 'ទឹកប្រាក់ទទួលបាន ($)'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono text-foreground">
            {rows.map((row) => (
              <tr key={row.month} className="hover:bg-muted/50 transition">
                <td className="p-4 pl-6 font-bold text-foreground font-sans">{row.monthLabel}</td>
                <td className="p-4 text-right">${row.rent.toFixed(2)}</td>
                <td className="p-4 text-right text-amber-700">${row.electricity.toFixed(2)}</td>
                <td className="p-4 text-right text-blue-700">${row.water.toFixed(2)}</td>
                <td className="p-4 text-right font-bold text-foreground">${row.total.toFixed(2)}</td>
                <td className="p-4 text-right font-black text-emerald-700 bg-emerald-50/20">
                  ${row.collected.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
