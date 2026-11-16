import { useTranslations } from 'next-intl';
import { formatUSD, formatKHRFromUSD } from '@/lib/format';

const usd0 = (v: number) => formatUSD(v, 0);

export function CollectionGauge({
  percent,
  collected,
  outstanding,
}: {
  percent: number;
  collected: number;
  outstanding: number;
}) {
  const t = useTranslations('Dashboard');
  return (
    <div className="bg-card border border-(--card-border) p-6 rounded-3xl flex flex-col shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          {t('payment_collection_rate')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('collection_rate_desc')}
        </p>
      </div>

      <div className="my-auto space-y-4" id="collection-rate-performance">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-muted-foreground">
              {t('overall_collection_efficiency')}
            </span>
            <span className="text-chart-2 font-bold">{percent}%</span>
          </div>
          <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
            <div
              className="bg-chart-2 h-full rounded-full transition-all duration-1000"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-chart-2/5 rounded-xl border border-chart-2/10">
            <span className="text-xs font-bold text-chart-2 block">
              {t('total_collected')}
            </span>
            <span className="text-lg font-bold text-chart-2 font-mono block mt-1">
              {usd0(collected)}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block font-mono">
              ≈ {formatKHRFromUSD(collected)}
            </span>
          </div>
          <div className="p-3 bg-destructive/5 rounded-xl border border-destructive/10">
            <span className="text-xs font-bold text-destructive block">
              {t('owed_balance')}
            </span>
            <span className="text-lg font-bold text-destructive font-mono block mt-1 text-destructive">
              {usd0(outstanding)}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block font-mono">
              ≈ {formatKHRFromUSD(outstanding)}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-center text-muted-foreground font-mono italic">
          {t('collection_calc_note')}
        </div>
      </div>
    </div>
  );
}
