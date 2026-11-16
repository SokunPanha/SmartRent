import { useTranslations } from 'next-intl';
import { MonthlyRevenuePoint } from '../dashboard.helpers';

export function RevenueChart({ data }: { data: MonthlyRevenuePoint[] }) {
  const t = useTranslations('Dashboard');
  return (
    <div className="bg-card border border-(--card-border) p-6 rounded-3xl flex flex-col shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          {t('revenue_trend')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('revenue_trend_desc')}
        </p>
      </div>

      <div className="relative w-full h-52 mt-auto" id="revenue-trend-chart-container">
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border)" strokeWidth="1" />
          <line x1="40" y1="60" x2="380" y2="60" stroke="var(--border)" strokeWidth="1" />
          <line x1="40" y1="100" x2="380" y2="100" stroke="var(--border)" strokeWidth="1" />
          <line x1="40" y1="140" x2="380" y2="140" stroke="var(--border)" strokeWidth="1" />
          <line x1="40" y1="170" x2="380" y2="170" stroke="var(--muted-foreground)" strokeWidth="1" />

          <text x="35" y="24" textAnchor="end" fontSize="8" fill="var(--muted-foreground)" className="font-mono">$1,000</text>
          <text x="35" y="64" textAnchor="end" fontSize="8" fill="var(--muted-foreground)" className="font-mono">$750</text>
          <text x="35" y="104" textAnchor="end" fontSize="8" fill="var(--muted-foreground)" className="font-mono">$500</text>
          <text x="35" y="144" textAnchor="end" fontSize="8" fill="var(--muted-foreground)" className="font-mono">$250</text>
          <text x="35" y="174" textAnchor="end" fontSize="8" fill="var(--muted-foreground)" className="font-mono">$0</text>

          {data.map((d, index) => {
            const xOffset = 70 + index * 110;
            const invoicedHeight = (d.invoiced / 1100) * 150;
            const collectedHeight = (d.collected / 1100) * 150;
            const barWidth = 24;

            return (
              <g key={index}>
                <rect
                  x={xOffset}
                  y={170 - invoicedHeight}
                  width={barWidth}
                  height={invoicedHeight}
                  rx="3"
                  fill="color-mix(in srgb, var(--chart-1) 40%, transparent)"
                  stroke="var(--chart-1)"
                  strokeWidth="1"
                  className="transition-all hover:fill-chart-1"
                />
                <text
                  x={xOffset + barWidth / 2}
                  y={170 - invoicedHeight - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="var(--chart-1)"
                  className="font-mono"
                >
                  ${d.invoiced}
                </text>

                <rect
                  x={xOffset + barWidth + 6}
                  y={170 - collectedHeight}
                  width={barWidth}
                  height={collectedHeight}
                  rx="3"
                  fill="var(--chart-2)"
                  className="transition-all hover:opacity-90"
                />
                <text
                  x={xOffset + barWidth + 6 + barWidth / 2}
                  y={170 - collectedHeight - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="var(--chart-2)"
                  className="font-mono"
                >
                  ${d.collected}
                </text>

                <text
                  x={xOffset + barWidth + 3}
                  y="188"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--muted-foreground)"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
          <span className="w-3.5 h-3.5 bg-chart-1/40 border border-chart-1 rounded-sm block"></span>
          {t('amount_billed')}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
          <span className="w-3.5 h-3.5 bg-chart-2 rounded-sm block"></span>
          {t('amount_received')}
        </div>
      </div>
    </div>
  );
}
