import { useTranslations } from 'next-intl';
import { Clock, User } from 'lucide-react';
import { ActivityLog, AppLanguage } from '@/lib/types';
import { pickLocale } from '@/lib/i18n';

export function RecentActivity({
  logs,
  lang,
}: {
  logs: ActivityLog[];
  lang: AppLanguage;
}) {
  const t = useTranslations('Dashboard');
  return (
    <div
      className="bg-card border border-border p-6 rounded-3xl shadow-lg shadow-black/20"
      id="dashboard-recent-activities"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-foreground tracking-wider uppercase flex items-center gap-2 font-mono">
          <Clock className="w-4 h-4 text-primary animate-pulse" />
          {t('recent_activities')}
        </h3>
        <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest font-mono">
          {t('live_logs')}
        </span>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6 italic font-sans">
          {t('no_activity')}
        </p>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {logs.slice(0, 5).map((log, logIdx) => {
              const isLast = logIdx === 4 || logIdx === logs.length - 1;
              const dateText =
                new Date(log.timestamp).toLocaleTimeString(lang === 'en' ? 'en-US' : 'km-KH', {
                  hour: '2-digit',
                  minute: '2-digit',
                }) +
                ' | ' +
                new Date(log.timestamp).toLocaleDateString(lang === 'en' ? 'en-US' : 'km-KH', {
                  month: 'short',
                  day: 'numeric',
                });

              let roleColor = 'text-muted-foreground bg-muted';
              if (log.role === 'owner')
                roleColor = 'text-chart-1 bg-chart-1/10 border-chart-1/20 border';
              if (log.role === 'manager')
                roleColor = 'text-chart-3 bg-chart-3/10 border-chart-3/20 border';
              if (log.role === 'staff')
                roleColor = 'text-chart-4 bg-chart-4/10 border-chart-4/20 border';
              if (log.role === 'accountant')
                roleColor = 'text-chart-2 bg-chart-2/10 border-chart-2/20 border';

              return (
                <li key={log.id}>
                  <div className="relative pb-8">
                    {!isLast ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-muted"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3 items-start">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center ring-8 ring-ring bg-muted">
                          <User className="w-4 h-4 text-primary" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                        <div>
                          <p className="text-sm text-foreground font-medium font-sans">
                            {pickLocale(lang, log.action, log.actionKh)}{' '}
                            <span className="text-xs text-muted-foreground font-normal block sm:inline sm:ml-2">
                              ({pickLocale(lang, log.details, log.detailsKh)})
                            </span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs text-muted-foreground font-bold">
                              {log.username}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md ${roleColor}`}
                            >
                              {log.role}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-[10px] text-muted-foreground font-mono shrink-0">
                          {dateText}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
