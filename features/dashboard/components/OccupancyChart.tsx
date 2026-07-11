import { useTranslations } from 'next-intl';
import { DashboardStats } from '../dashboard.helpers';

export function OccupancyChart({
  stats,
  occupiedPct,
  vacantPct,
  maintPct,
}: {
  stats: DashboardStats;
  occupiedPct: number;
  vacantPct: number;
  maintPct: number;
}) {
  const t = useTranslations('Dashboard');
  return (
    <div className="bg-card border border-border p-6 rounded-3xl flex flex-col shadow-lg shadow-black/20">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-foreground tracking-wider uppercase font-mono">
          {t('occupancy_rate')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('occupancy_rate_desc')}
        </p>
      </div>

      <div
        className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto"
        id="occupancy-rate-breakdown"
      >
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border)" strokeWidth="3" />

            {occupiedPct > 0 && (
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="var(--chart-2)"
                strokeWidth="3.5"
                strokeDasharray={`${occupiedPct} ${100 - occupiedPct}`}
                strokeDashoffset="0"
              />
            )}

            {vacantPct > 0 && (
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="var(--chart-3)"
                strokeWidth="3.5"
                strokeDasharray={`${vacantPct} ${100 - vacantPct}`}
                strokeDashoffset={`-${occupiedPct}`}
              />
            )}

            {maintPct > 0 && (
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="var(--chart-1)"
                strokeWidth="3.5"
                strokeDasharray={`${maintPct} ${100 - maintPct}`}
                strokeDashoffset={`-${occupiedPct + vacantPct}`}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground font-sans">{occupiedPct}%</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold font-mono">
              {t('occupied_donut_label')}
            </span>
          </div>
        </div>

        <div className="space-y-3 shrink-0">
          <div className="flex items-center gap-3 bg-chart-2/5 p-2 px-3 rounded-lg border border-chart-2/10">
            <span className="w-3 h-3 rounded-full bg-chart-2 block"></span>
            <div>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider font-mono">
                {t('occupied')}
              </p>
              <p className="text-sm font-semibold text-foreground font-sans">
                {stats.occupiedRooms} {t('room_count')}{' '}
                <span className="text-xs text-muted-foreground">({occupiedPct}%)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-chart-3/5 p-2 px-3 rounded-lg border border-chart-3/10">
            <span className="w-3 h-3 rounded-full bg-chart-3 block"></span>
            <div>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider font-mono">
                {t('vacant')}
              </p>
              <p className="text-sm font-semibold text-foreground font-sans">
                {stats.vacantRooms} {t('room_count')}{' '}
                <span className="text-xs text-muted-foreground">({vacantPct}%)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-chart-1/5 p-2 px-3 rounded-lg border border-chart-1/10">
            <span className="w-3 h-3 rounded-full bg-chart-1 block"></span>
            <div>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider font-mono">
                {t('maintenance')}
              </p>
              <p className="text-sm font-semibold text-foreground font-sans">
                {stats.maintenanceRooms} {t('room_count')}{' '}
                <span className="text-xs text-muted-foreground">({maintPct}%)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
