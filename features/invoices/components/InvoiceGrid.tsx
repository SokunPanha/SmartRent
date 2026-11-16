import { useTranslations } from 'next-intl';
import { CheckCircle2, ClipboardList, Coins, FileText, Send } from 'lucide-react';
import { Invoice, Room, Tenant, Property, AppLanguage } from '@/lib/types';
import { pickLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { StatusBadge, StatusBadgeTone } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MonthOption } from '../invoices.helpers';
import { fmtKHR, fmtUSD, invoiceTotals } from '../invoice-document';

function statusMeta(status: Invoice['status'], t: (k: string) => string): { tone: StatusBadgeTone; label: string } {
  if (status === 'paid') return { tone: 'success', label: t('paid') };
  if (status === 'partial') return { tone: 'warning', label: t('partial') };
  if (status === 'overdue') return { tone: 'danger', label: t('overdue') };
  return { tone: 'danger', label: t('unpaid') };
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

/** Small Telegram delivery indicator: a dot + one word, full detail on hover. */
function TelegramState({ inv, t }: { inv: Invoice; t: (k: string) => string }) {
  const map = {
    sent: { dot: 'bg-chart-2', text: `${t('inv_sent')} · ${inv.telegramSentDate ?? ''}` },
    failed: { dot: 'bg-destructive', text: t('inv_failed') },
    scheduled: { dot: 'bg-info', text: `${t('inv_scheduled')} · ${inv.telegramScheduledDate ?? ''}` },
    unscheduled: { dot: 'bg-muted-foreground/40', text: t('inv_unscheduled') },
  } as const;
  const s = map[inv.telegramStatus ?? 'unscheduled'];
  return (
    <span
      className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"
      title={inv.telegramStatus === 'failed' ? inv.telegramError : undefined}
    >
      <Send className="size-3.5 shrink-0" />
      <span className={cn('size-1.5 shrink-0 rounded-full', s.dot)} />
      <span className="truncate">{s.text}</span>
    </span>
  );
}

/**
 * Invoice cards: who (tenant + room), how much is due, when, and the three
 * actions. The full breakdown lives in the invoice itself (View invoice).
 */
export function InvoiceGrid({
  invoices,
  rooms,
  properties,
  tenants,
  activeMonths,
  canPay,
  onPrint,
  onDispatch,
  onPay,
  lang,
}: {
  invoices: Invoice[];
  rooms: Room[];
  properties: Property[];
  tenants: Tenant[];
  activeMonths: MonthOption[];
  canPay: boolean;
  onPrint: (inv: Invoice) => void;
  onDispatch: (inv: Invoice) => void;
  onPay: (inv: Invoice) => void;
  lang: AppLanguage;
}) {
  const t = useTranslations('Invoices');

  if (invoices.length === 0) {
    return <EmptyState icon={ClipboardList} title={t('no_invoices_match_filters')} />;
  }

  return (
    <div className="@container" id="invoices-registry-grid-list">
      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {invoices.map((inv) => {
          const room = rooms.find((r) => r.id === inv.roomId);
          const prop = properties.find((p) => p.id === room?.propertyId);
          const tenant = tenants.find((tn) => tn.id === inv.tenantId);
          const tenantName = tenant ? pickLocale(lang, tenant.name, tenant.nameKh) : '—';
          const propName = prop ? pickLocale(lang, prop.name, prop.nameKh) : '';
          const period = `${activeMonths.find((m) => m.value === inv.month)?.label ?? inv.month} ${inv.year}`;
          const status = statusMeta(inv.status, t);
          const totals = invoiceTotals(inv);
          const isPaid = inv.status === 'paid';
          const paidPct = inv.totalAmountUSD > 0 ? Math.min(100, (inv.amountPaidUSD / inv.totalAmountUSD) * 100) : 0;

          return (
            <article
              key={inv.id}
              className="flex flex-col rounded-(--radius-card) border border-(--card-border) bg-card p-5 shadow-card transition hover:border-primary/25"
            >
              {/* Who */}
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {initials(tenant?.name ?? tenantName)}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-base font-semibold text-foreground">{tenantName}</h4>
                  <p className="truncate text-sm text-muted-foreground">
                    {t('card_room', { room: room?.roomNumber ?? '—' })}
                    {propName && ` · ${propName}`}
                  </p>
                </div>
                <StatusBadge tone={status.tone} className="shrink-0">
                  {status.label}
                </StatusBadge>
              </div>

              {/* How much, when */}
              <div className="mt-5 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{isPaid ? t('card_total') : t('card_balance')}</p>
                  <p
                    className={cn(
                      'font-mono text-2xl font-bold tracking-tight',
                      isPaid ? 'text-foreground' : inv.status === 'overdue' ? 'text-destructive' : 'text-foreground'
                    )}
                  >
                    {fmtUSD(isPaid ? inv.totalAmountUSD : totals.balanceUSD)}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    ≈ {fmtKHR(isPaid ? inv.totalAmountKHR : totals.balanceKHR)}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <p className="font-medium text-foreground">{period}</p>
                  <p className={cn('mt-0.5', inv.status === 'overdue' ? 'font-semibold text-destructive' : 'text-muted-foreground')}>
                    {isPaid && inv.paidDate
                      ? t('card_paid_on', { date: inv.paidDate })
                      : t('card_due', { date: inv.dueDate })}
                  </p>
                </div>
              </div>

              {inv.status === 'partial' && (
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-chart-1" style={{ width: `${paidPct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('card_paid_of', { paid: fmtUSD(inv.amountPaidUSD), total: fmtUSD(inv.totalAmountUSD) })}
                  </p>
                </div>
              )}

              {/* Meta */}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{inv.invoiceNumber}</span>
                <TelegramState inv={inv} t={t} />
              </div>

              {/* Actions: one primary action + two round icon buttons */}
              <div className="mt-4 flex items-center gap-2">
                {isPaid ? (
                  <span className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-chart-2/10 text-sm font-semibold text-chart-2">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span className="truncate">{t('cleared')}</span>
                  </span>
                ) : canPay ? (
                  <button
                    onClick={() => onPay(inv)}
                    className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold whitespace-nowrap text-primary-foreground shadow-[0_6px_16px_-6px_var(--primary)] transition hover:bg-primary/90 cursor-pointer"
                  >
                    <Coins className="size-4 shrink-0" />
                    <span className="truncate">{t('record_payment_button')}</span>
                  </button>
                ) : (
                  <span className="flex-1" />
                )}
                <button
                  onClick={() => onPrint(inv)}
                  aria-label={t('view_invoice')}
                  title={t('view_invoice')}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted cursor-pointer"
                >
                  <FileText className="size-4" />
                </button>
                <button
                  onClick={() => onDispatch(inv)}
                  aria-label={t('card_send_telegram')}
                  title={t('card_send_telegram')}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-info transition hover:bg-info/10 cursor-pointer"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
