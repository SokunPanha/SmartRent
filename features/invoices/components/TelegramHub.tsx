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
  const recipients = tenants.filter((t) => !!t.telegramChatId).length;
  const queued = c.filteredInvoices.filter(
    (inv) => inv.status !== 'paid' && tenants.some((t) => t.id === inv.tenantId && t.telegramChatId)
  ).length;
  const sent = c.filteredInvoices.filter((inv) => inv.telegramStatus === 'sent').length;
  const failed = c.filteredInvoices.filter((inv) => inv.telegramStatus === 'failed').length;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-card text-white p-5 rounded-2xl border border-indigo-500/30 shadow-md space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 px-2.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] uppercase font-bold tracking-widest border border-indigo-400/20">
              PWA Automated Service
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h3 className="text-lg font-bold font-sans tracking-tight flex items-center gap-1.5">
            <Send className="w-5 h-5 text-indigo-400" />
            {lang === 'en'
              ? 'Telegram Invoice Delivery & Scheduler Hub'
              : 'ប្រព័ន្ធស្វ័យប្រវត្តិបញ្ជូនវិក្កយបត្រតេឡេក្រាម'}
          </h3>
          <p className="text-xs text-muted-foreground font-sans max-w-xl">
            {lang === 'en'
              ? 'Generate, schedule, and instantly dispatch rental invoices directly to tenants on Telegram. Set custom automated dates for monthly delivery sweeps.'
              : 'បង្កើត គ្រោងទុក និងបញ្ជូនវិក្កយបត្រថ្លៃឈ្នួលបន្ទប់សរុប ទៅទូរស័ព្ទរបស់អតិថិជននៅលើតេឡេក្រាមប្រចាំខែ។'}
          </p>
        </div>

        <button
          onClick={() => c.setTelegramIsSettingsOpen(!c.telegramIsSettingsOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-card/10 hover:bg-card/20 text-indigo-200 hover:text-white rounded-lg transition border border-white/10 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          {lang === 'en' ? 'Bot Credentials' : 'កំណត់លេខសម្គាល់ Bot'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-card/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">
            {lang === 'en' ? 'Active Recipients' : 'អ្នកជួលភ្ជាប់តេឡេក្រាម'}
          </p>
          <p className="text-xl font-mono font-bold text-indigo-300 mt-1">
            {recipients} <span className="text-xs text-muted-foreground font-sans">/ {tenants.length}</span>
          </p>
        </div>
        <div className="bg-card/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">
            {lang === 'en' ? 'Scheduled Queue' : 'វិក្កយបត្រត្រូវបាញ់'}
          </p>
          <p className="text-xl font-mono font-bold text-amber-300 mt-1">{queued}</p>
        </div>
        <div className="bg-card/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">
            {lang === 'en' ? 'Successful Sends' : 'វិក្កយបត្រផ្ញើរួច'}
          </p>
          <p className="text-xl font-mono font-bold text-emerald-400 mt-1">{sent}</p>
        </div>
        <div className="bg-card/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">
            {lang === 'en' ? 'Deliveries Failed' : 'ការផ្ញើបរាជ័យ'}
          </p>
          <p className="text-xl font-mono font-bold text-rose-400 mt-1">{failed}</p>
        </div>
      </div>

      <div className="bg-background/40 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shrink-0">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-indigo-300 font-sans tracking-wider block">
              {lang === 'en' ? 'Scheduled Auto-Send Date' : 'កាលបរិច្ឆេទស្កេនបញ្ជូនស្វ័យប្រវត្តិ'}
            </label>
            <div className="flex items-center gap-2 bg-card border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={c.telegramScheduledDate}
                onChange={(e) => c.handleSaveScheduledDate(e.target.value)}
                className="bg-transparent text-white focus:outline-none font-mono"
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
                ? 'bg-indigo-600/50 text-indigo-200 border border-indigo-500/20'
                : 'bg-indigo-500 hover:bg-indigo-400 text-white border border-indigo-400'
            }`}
          >
            {c.telegramIsDispatching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {lang === 'en' ? 'Dispatching Queue...' : 'កំពុងបញ្ជូនស្វ័យប្រវត្តិ...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {lang === 'en' ? 'Run Scheduled Send Sweep' : 'ដំណើរការបញ្ជូនស្វ័យប្រវត្តិប្រចាំខែ'}
              </>
            )}
          </button>
        </div>
      </div>

      {c.telegramIsSettingsOpen && (
        <div className="bg-background/80 p-4 rounded-xl border border-white/10 space-y-3 font-sans text-xs text-muted-foreground">
          <h4 className="font-bold text-white text-sm flex items-center gap-1">
            <Settings className="w-4 h-4 text-indigo-400" />
            {lang === 'en'
              ? 'Telegram Bot Channel Identity & Authentication'
              : 'ការកំណត់អត្តសញ្ញាណប៊្លូធូសមេសសិញតេឡេក្រាម'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-muted-foreground font-bold uppercase block tracking-wider">
                Bot Token (from @BotFather)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="e.g. 729184938:AAE89..."
                  value={c.telegramBotToken}
                  onChange={(e) => c.handleSaveToken(e.target.value)}
                  className="w-full bg-card border border-white/15 px-3 py-2 rounded-lg font-mono text-white text-[11px] focus:outline-none focus:border-indigo-500 shrink"
                />
                <button
                  onClick={c.handleTestBotConnection}
                  disabled={c.telegramTestStatus === 'loading'}
                  className="px-3 py-2 bg-card/10 hover:bg-card/15 text-indigo-300 font-semibold rounded-lg shrink-0 transition cursor-pointer"
                >
                  {c.telegramTestStatus === 'loading' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : lang === 'en' ? (
                    'Validate'
                  ) : (
                    'តេស្ត'
                  )}
                </button>
              </div>
              {c.telegramTestStatus === 'success' && (
                <p className="text-[10px] text-emerald-400 font-bold font-mono">✓ API authentication successful! Bot is ready.</p>
              )}
              {c.telegramTestStatus === 'failed' && (
                <p className="text-[10px] text-rose-400 font-bold font-mono">✗ API Connection failed. Verify Token or Bot setup.</p>
              )}
            </div>

            <div className="bg-card/5 p-3 rounded-lg border border-white/5 space-y-1.5 flex flex-col justify-center">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={c.telegramBotToken.includes('MOCK_TELEGRAM_TOKEN')}
                  onChange={(e) =>
                    c.handleSaveToken(e.target.checked ? '7829482938:AAE_MOCK_TELEGRAM_TOKEN_DEFAULT' : '')
                  }
                  className="rounded border-border text-indigo-500 focus:ring-ring"
                />
                <div>
                  <span className="font-bold text-white text-[11px] block">
                    {lang === 'en' ? 'Sandbox / Simulate Mode' : 'របៀបសាកល្បង / បញ្ជូនសម្តែង'}
                  </span>
                  <span className="text-[9px] text-muted-foreground block">
                    {lang === 'en'
                      ? 'Simulates realistic deliveries with active terminal logs.'
                      : 'ដំណើរការបញ្ជូនដោយមិនទាមទារ Bot Token។'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-indigo-300">
              {lang === 'en' ? 'How to set up Telegram Bot?' : 'របៀបបង្កើត Bot តេឡេក្រាម៖'}
            </p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>
                {lang === 'en'
                  ? 'Search for @BotFather in Telegram and send "/newbot" to generate a your Bot Agent.'
                  : 'ស្កេនរក @BotFather រួចផ្ញើពាក្យ "/newbot" ដើម្បីបង្កើត Robot របស់អ្នក។'}
              </li>
              <li>
                {lang === 'en'
                  ? 'Copy the Token provided into the input field above.'
                  : 'ចម្លង Token ដែលផ្តល់ដោយវា រួចដាក់បញ្ជូលក្នុងប្រអប់ខាងលើ។'}
              </li>
              <li>
                {lang === 'en'
                  ? 'Ask tenants to find their unique Chat ID via @CheckMyIDBot and save it onto their profile page.'
                  : 'សុំអោយអ្នកជួលរកលេខសម្គាល់គណនីរបស់ពួកគេតាមរយះ Robot @CheckMyIDBot រួចកត់ទុកក្នុងទំព័រព័ត៌មានអ្នកជួល។'}
              </li>
            </ol>
          </div>
        </div>
      )}

      {c.telegramLogs.length > 0 && (
        <div className="bg-black/80 rounded-xl border border-white/10 p-3 font-mono text-[10px] space-y-2">
          <div className="flex justify-between items-center text-muted-foreground border-b border-white/5 pb-1.5">
            <span>✈️ AUTOMATION HUB LIVE LOGGER CONSOLE</span>
            <button
              onClick={() => c.setTelegramLogs([])}
              className="text-muted-foreground hover:text-white transition uppercase text-[9px] cursor-pointer"
            >
              Clear Console
            </button>
          </div>
          {c.telegramIsDispatching && (
            <div className="w-full bg-card rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${c.telegramProgress}%` }}
              ></div>
            </div>
          )}
          <div className="max-h-36 overflow-y-auto space-y-0.5 custom-scrollbar text-emerald-400">
            {c.telegramLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
