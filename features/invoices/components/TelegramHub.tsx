import { useTranslations } from 'next-intl';
import { Send, Settings, Loader2, CalendarDays } from 'lucide-react';
import { Tenant, AppLanguage } from '@/lib/types';
import { useInvoicesController } from '../use-invoices-controller';

type Controller = ReturnType<typeof useInvoicesController>;

export function TelegramHub({
  c,
  tenants,
  lang,
}: {
  c: Controller;
  tenants: Tenant[];
  lang: AppLanguage;
}) {
  const t = useTranslations('Invoices');
  const recipients = tenants.filter((tn) => !!tn.telegramChatId).length;
  const queued = c.filteredInvoices.filter(
    (inv) => inv.status !== 'paid' && tenants.some((tn) => tn.id === inv.tenantId && tn.telegramChatId)
  ).length;
  const sent = c.filteredInvoices.filter((inv) => inv.telegramStatus === 'sent').length;
  const failed = c.filteredInvoices.filter((inv) => inv.telegramStatus === 'failed').length;

  return (
    <div className="bg-card text-foreground p-5 rounded-2xl border border-primary/30 shadow-md space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 px-2.5 rounded-full bg-primary/20 text-primary font-mono text-[10px] uppercase font-bold tracking-widest border border-primary/30">
              {t('telegram_service_badge')}
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2"></span>
            </span>
          </div>
          <h3 className="text-lg font-bold font-sans tracking-tight flex items-center gap-1.5">
            <Send className="w-5 h-5 text-primary" />
            {t('telegram_hub_title')}
          </h3>
          <p className="text-xs text-muted-foreground font-sans max-w-xl">
            {t('telegram_hub_subtitle')}
          </p>
        </div>

        <button
          onClick={() => c.setTelegramIsSettingsOpen(!c.telegramIsSettingsOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-card/10 hover:bg-card/20 text-primary hover:text-foreground rounded-lg transition border border-border cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          {t('bot_credentials')}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-card/5 border border-border rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">
            {t('active_recipients')}
          </p>
          <p className="text-xl font-mono font-bold text-primary mt-1">
            {recipients} <span className="text-xs text-muted-foreground font-sans">/ {tenants.length}</span>
          </p>
        </div>
        <div className="bg-card/5 border border-border rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">
            {t('scheduled_queue')}
          </p>
          <p className="text-xl font-mono font-bold text-chart-1 mt-1">{queued}</p>
        </div>
        <div className="bg-card/5 border border-border rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">
            {t('successful_sends')}
          </p>
          <p className="text-xl font-mono font-bold text-chart-2 mt-1">{sent}</p>
        </div>
        <div className="bg-card/5 border border-border rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">
            {t('deliveries_failed')}
          </p>
          <p className="text-xl font-mono font-bold text-destructive mt-1">{failed}</p>
        </div>
      </div>

      <div className="bg-background/40 p-4 rounded-xl border border-border flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shrink-0">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-primary font-sans tracking-wider block">
              {t('scheduled_auto_send_date')}
            </label>
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={c.telegramScheduledDate}
                onChange={(e) => c.handleSaveScheduledDate(e.target.value)}
                className="bg-transparent text-foreground focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center self-end md:self-auto">
          <button
            onClick={c.handleTriggerScheduledQueue}
            disabled={c.telegramIsDispatching}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-lg transition shadow-sm cursor-pointer ${
              c.telegramIsDispatching
                ? 'bg-primary/50 text-primary-foreground/70 border border-primary/20'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground border border-primary'
            }`}
          >
            {c.telegramIsDispatching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('dispatching_queue')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t('run_scheduled_send_sweep')}
              </>
            )}
          </button>
        </div>
      </div>

      {c.telegramIsSettingsOpen && (
        <div className="bg-background/80 p-4 rounded-xl border border-border space-y-3 font-sans text-xs text-muted-foreground">
          <h4 className="font-bold text-foreground text-sm flex items-center gap-1">
            <Settings className="w-4 h-4 text-primary" />
            {t('telegram_bot_connection')}
          </h4>

          <div className="flex items-center gap-2">
            <button
              onClick={c.handleTestBotConnection}
              disabled={c.telegramTestStatus === 'loading'}
              className="px-3 py-2 bg-card/10 hover:bg-card/15 text-primary font-semibold rounded-lg shrink-0 transition cursor-pointer"
            >
              {c.telegramTestStatus === 'loading' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                t('test_connection')
              )}
            </button>
            {c.telegramTestStatus === 'success' && (
              <p className="text-[10px] text-chart-2 font-bold font-mono">✓ {t('bot_connected')}</p>
            )}
            {c.telegramTestStatus === 'failed' && (
              <p className="text-[10px] text-destructive font-bold font-mono">
                ✗ {t('bot_not_reachable')}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-border text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-primary">
              {t('connecting_a_tenant')}
            </p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>
                {t('connect_step_1')}
              </li>
              <li>
                {t('connect_step_2')}
              </li>
              <li>
                {t('connect_step_3')}
              </li>
            </ol>
          </div>
        </div>
      )}

      {c.telegramLogs.length > 0 && (
        <div className="bg-black/80 rounded-xl border border-border p-3 font-mono text-[10px] space-y-2">
          <div className="flex justify-between items-center text-muted-foreground border-b border-border pb-1.5">
            <span>✈️ {t('telegram_console_title')}</span>
            <button
              onClick={() => c.setTelegramLogs([])}
              className="text-muted-foreground hover:text-foreground transition uppercase text-[9px] cursor-pointer"
            >
              {t('telegram_clear_console')}
            </button>
          </div>
          {c.telegramIsDispatching && (
            <div className="w-full bg-card rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${c.telegramProgress}%` }}
              ></div>
            </div>
          )}
          <div className="max-h-36 overflow-y-auto space-y-0.5 custom-scrollbar text-chart-2">
            {c.telegramLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
