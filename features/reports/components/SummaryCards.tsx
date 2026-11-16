import { TrendingUp, Coins, Receipt, Wrench, PiggyBank } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppLanguage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatUSD, formatKHRFromUSD } from '@/lib/format';
import { ReportData } from '../reports.helpers';

/** Year totals: billed, cash received, still owed, expenses, net profit. */
export function SummaryCards({ data }: { data: ReportData; lang: AppLanguage }) {
  const t = useTranslations('Reports');
  const cards = [
    { label: t('gross_revenue_invoiced'), value: data.totalInvoiced, icon: Coins, tone: 'text-primary bg-primary/10' },
    { label: t('cash_received'), value: data.totalCollected, icon: TrendingUp, tone: 'text-chart-2 bg-chart-2/10' },
    { label: t('outstanding_ar'), value: data.totalOutstanding, icon: Receipt, tone: 'text-destructive bg-destructive/10' },
    { label: t('expenses_total'), value: data.totalExpenses, icon: Wrench, tone: 'text-chart-3 bg-chart-3/10' },
    {
      label: t('net_profit'),
      value: data.netProfit,
      icon: PiggyBank,
      tone: data.netProfit >= 0 ? 'text-chart-2 bg-chart-2/10' : 'text-destructive bg-destructive/10',
    },
  ];
  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-4 @3xl:grid-cols-3 @5xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-(--radius-card) border border-(--card-border) bg-card p-5 shadow-card">
            <span className={cn('flex size-10 items-center justify-center rounded-full', tone)}>
              <Icon className="size-5" />
            </span>
            <span className="mt-3 block text-xs font-semibold text-muted-foreground">{label}</span>
            <span className="mt-1 block font-mono text-xl font-bold text-foreground">{formatUSD(value)}</span>
            <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">≈ {formatKHRFromUSD(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
