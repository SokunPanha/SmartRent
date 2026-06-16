import { TrendingUp, Coins, Receipt } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { formatUSD, formatKHRFromUSD } from '@/lib/format';
import { ReportData } from '../reports.helpers';

export function SummaryCards({
  data,
  lang,
}: {
  data: ReportData;
  lang: AppLanguage;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card p-5 rounded-2xl border border-border shadow-3xs hover:border-emerald-200 transition">
        <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 p-2.5 rounded-xl w-fit">
          <Coins className="w-5 h-5" />
        </div>
        <div className="mt-4">
          <span className="text-xs text-muted-foreground uppercase tracking-widest block font-bold">
            {lang === 'en' ? 'Gross Revenue Invoiced' : 'ថ្លៃឈ្នួលវិក្កយបត្រសរុប'}
          </span>
          <span className="text-2xl font-black text-foreground font-mono block mt-1">
            {formatUSD(data.totalInvoiced)}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
            ≈ {formatKHRFromUSD(data.totalInvoiced)}
          </span>
        </div>
      </div>

      <div className="bg-card p-5 rounded-2xl border border-border shadow-3xs hover:border-emerald-200 transition">
        <div className="flex justify-between items-center text-emerald-700 bg-emerald-100/50 p-2.5 rounded-xl w-fit">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="mt-4">
          <span className="text-xs text-muted-foreground uppercase tracking-widest block font-bold">
            {lang === 'en' ? 'Total Cash Receipts Collected' : 'ការប្រមូលប្រាក់សុទ្ធរួចរាល់'}
          </span>
          <span className="text-2xl font-black text-emerald-700 font-mono block mt-1">
            {formatUSD(data.totalCollected)}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
            ≈ {formatKHRFromUSD(data.totalCollected)}
          </span>
        </div>
      </div>

      <div className="bg-card p-5 rounded-2xl border border-border shadow-3xs hover:border-emerald-200 transition">
        <div className="flex justify-between items-center text-rose-600 bg-rose-50 p-2.5 rounded-xl w-fit">
          <Receipt className="w-5 h-5" />
        </div>
        <div className="mt-4">
          <span className="text-xs text-muted-foreground uppercase tracking-widest block font-bold">
            {lang === 'en' ? 'Outstanding AR Receivable' : 'គណនីត្រូវប្រមូលប្រាក់ ( Receivable)'}
          </span>
          <span className="text-2xl font-black text-rose-600 font-mono block mt-1">
            {formatUSD(data.totalOutstanding)}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
            ≈ {formatKHRFromUSD(data.totalOutstanding)}
          </span>
        </div>
      </div>
    </div>
  );
}
