import { AppLanguage } from '@/lib/types';
import { DashboardStats } from '../dashboard.helpers';

export function OccupancyChart({
  stats,
  occupiedPct,
  vacantPct,
  maintPct,
  t,
  lang,
}: {
  stats: DashboardStats;
  occupiedPct: number;
  vacantPct: number;
  maintPct: number;
  t: any;
  lang: AppLanguage;
}) {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl flex flex-col shadow-lg shadow-black/20">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-foreground tracking-wider uppercase font-mono">
          {t.occupancy_rate}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {lang === 'en'
            ? 'Distribution of room statuses across properties'
            : 'ការបែងចែកស្ថានភាពបន្ទប់ជួលសរុប'}
        </p>
      </div>

      <div
        className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto"
        id="occupancy-rate-breakdown"
      >
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#27272a" strokeWidth="3" />

            {occupiedPct > 0 && (
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#10b981"
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
                stroke="#6366f1"
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
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeDasharray={`${maintPct} ${100 - maintPct}`}
                strokeDashoffset={`-${occupiedPct + vacantPct}`}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground font-sans">{occupiedPct}%</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold font-mono">
              {lang === 'en' ? 'Occupied' : 'ជួលហើយ'}
            </span>
          </div>
        </div>

        <div className="space-y-3 shrink-0">
          <div className="flex items-center gap-3 bg-emerald-500/5 p-2 px-3 rounded-lg border border-emerald-500/10">
            <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
            <div>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider font-mono">
                {t.occupied}
              </p>
              <p className="text-sm font-semibold text-foreground font-sans">
                {stats.occupiedRooms} {t.room_count}{' '}
                <span className="text-xs text-muted-foreground">({occupiedPct}%)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-indigo-500/5 p-2 px-3 rounded-lg border border-indigo-500/10">
            <span className="w-3 h-3 rounded-full bg-indigo-500 block"></span>
            <div>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider font-mono">
                {t.vacant}
              </p>
              <p className="text-sm font-semibold text-foreground font-sans">
                {stats.vacantRooms} {t.room_count}{' '}
                <span className="text-xs text-muted-foreground">({vacantPct}%)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-amber-500/5 p-2 px-3 rounded-lg border border-amber-500/10">
            <span className="w-3 h-3 rounded-full bg-amber-500 block"></span>
            <div>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider font-mono">
                {lang === 'en' ? 'Maintenance' : 'កំពុងជួសជុល'}
              </p>
              <p className="text-sm font-semibold text-foreground font-sans">
                {stats.maintenanceRooms} {t.room_count}{' '}
                <span className="text-xs text-muted-foreground">({maintPct}%)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
