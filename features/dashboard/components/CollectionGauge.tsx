import { AppLanguage } from '@/lib/types';
import { formatUSD, formatKHRFromUSD } from '@/lib/format';

const usd0 = (v: number) => formatUSD(v, 0);

export function CollectionGauge({
  percent,
  collected,
  outstanding,
  t,
  lang,
}: {
  percent: number;
  collected: number;
  outstanding: number;
  t: any;
  lang: AppLanguage;
}) {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl flex flex-col shadow-lg shadow-black/20">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-foreground tracking-wider uppercase font-mono">
          {t.payment_collection_rate}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {lang === 'en'
            ? 'Cash flow performance against total billings allocated'
            : 'លទ្ធផលលំហូរប្រាក់ធៀបការវិក្កយបត្រសរុប'}
        </p>
      </div>

      <div className="my-auto space-y-4" id="collection-rate-performance">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-muted-foreground">
              {lang === 'en' ? 'Overall Collection Efficiency' : 'ប្រសិទ្ធភាពនៃការប្រមូលប្រាក់ទូទៅ'}
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
            <span className="text-[10px] font-bold text-chart-2 tracking-wider uppercase block font-mono">
              {lang === 'en' ? 'Total Collected' : 'ប្រមូលប្រាក់រួច'}
            </span>
            <span className="text-lg font-bold text-chart-2 font-mono block mt-1">
              {usd0(collected)}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block font-mono">
              ≈ {formatKHRFromUSD(collected)}
            </span>
          </div>
          <div className="p-3 bg-destructive/5 rounded-xl border border-destructive/10">
            <span className="text-[10px] font-bold text-destructive tracking-wider uppercase block font-mono">
              {lang === 'en' ? 'Owed Balance' : 'ប្រាក់ជំពាក់នៅសល់'}
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
          {lang === 'en'
            ? '* Calculations are compiled from April - June 15, 2026 invoice sequences'
            : '* ការគណនាត្រូវបានចងក្រងពីលំដាប់វិក្កយបត្រខែមេសា ដល់ ១៥ មិថុនា ២០២៦'}
        </div>
      </div>
    </div>
  );
}
