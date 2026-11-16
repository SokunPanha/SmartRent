'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BellRing, CalendarClock, Loader2, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPatch } from '@/lib/api/client';
import { SystemSettings } from '@/lib/types';
import { useCan } from '@/features/admin/permissions.queries';
import { settingsKeys } from '@/features/settings/settings.queries';

type Patch = Partial<Pick<SystemSettings, 'telegramSendDay' | 'overdueRemindersEnabled' | 'reminderIntervalDays'>>;

/**
 * Server-side Telegram automation: the day each month invoices are sent
 * automatically, and overdue reminders. Runs on the server (every 30 min),
 * so nobody needs to keep the app open. Editable with admin.settings.
 */
export function TelegramAutomationCard({ settings }: { settings: SystemSettings }) {
  const t = useTranslations('Invoices');
  const can = useCan();
  const editable = can('admin.settings');
  const qc = useQueryClient();
  const [sendDay, setSendDay] = useState<string>(settings.telegramSendDay ? String(settings.telegramSendDay) : '');
  const [reminders, setReminders] = useState(settings.overdueRemindersEnabled);
  const [interval, setIntervalDays] = useState(settings.reminderIntervalDays);

  const save = useMutation({
    mutationFn: (patch: Patch) => apiPatch<SystemSettings>('/api/settings/telegram', patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success(t('automation_saved'));
    },
    onError: (e) => toast.error(e.message),
  });

  const dirty =
    (sendDay ? Number(sendDay) : null) !== (settings.telegramSendDay ?? null) ||
    reminders !== settings.overdueRemindersEnabled ||
    interval !== settings.reminderIntervalDays;

  return (
    <section className="rounded-(--radius-card) border border-(--card-border) bg-card p-5 shadow-card space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CalendarClock className="size-5 text-primary" />
            {t('automation_title')}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('automation_desc')}</p>
        </div>
        {editable && (
          <button
            onClick={() =>
              save.mutate({
                telegramSendDay: sendDay ? Number(sendDay) : null,
                overdueRemindersEnabled: reminders,
                reminderIntervalDays: interval,
              })
            }
            disabled={!dirty || save.isPending}
            className="flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 cursor-pointer disabled:opacity-40"
          >
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {t('automation_save')}
          </button>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground">{t('auto_send_day_label')}</span>
          <select
            value={sendDay}
            disabled={!editable}
            onChange={(e) => setSendDay(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm"
          >
            <option value="">{t('auto_send_off')}</option>
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {t('auto_send_day_option', { day: d })}
              </option>
            ))}
          </select>
          <span className="block text-[11px] text-muted-foreground">{t('auto_send_help')}</span>
        </label>

        <div className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <BellRing className="size-3.5" />
            {t('reminders_label')}
          </span>
          <label className="flex h-11 items-center gap-2 rounded-xl border border-input bg-card px-4 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={reminders}
              disabled={!editable}
              onChange={(e) => setReminders(e.target.checked)}
              className="size-4"
            />
            {t('reminders_enable')}
          </label>
          {reminders && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              {t('reminders_every')}
              <input
                type="number"
                min={1}
                max={30}
                value={interval}
                disabled={!editable}
                onChange={(e) => setIntervalDays(Number(e.target.value))}
                className="h-9 w-20 rounded-lg border border-input bg-card px-2 text-sm"
              />
              {t('reminders_days')}
            </label>
          )}
          <span className="block text-[11px] text-muted-foreground">{t('reminders_help')}</span>
        </div>
      </div>
    </section>
  );
}
