'use client';

import { useTranslations } from 'next-intl';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePaymentsLedger } from '@/features/invoices/invoices.queries';
import { METHOD_LABEL, fmtUSD } from '@/features/invoices/invoice-document';

/** Every payment this tenant has made (newest first), voided ones struck out. */
export function TenantPaymentHistory({ tenantId }: { tenantId: string }) {
  const t = useTranslations('Tenants');
  const { data: rows = [], isLoading } = usePaymentsLedger({ tenantId });
  const total = rows.filter((p) => !p.voidedAt).reduce((s, p) => s + p.amountUSD, 0);

  return (
    <section className="overflow-hidden rounded-(--radius-card) border border-(--card-border) bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4 md:px-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Wallet className="size-5 text-primary" />
          {t('payment_history')}
        </h3>
        <span className="text-sm text-muted-foreground">
          {t('total_paid')}: <span className="font-mono font-bold text-foreground">{fmtUSD(total)}</span>
        </span>
      </div>
      {isLoading ? null : rows.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">{t('no_payments_yet')}</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {rows.map((p) => (
            <li key={p.id} className={cn('flex flex-wrap items-center justify-between gap-2 px-4 py-3 md:px-5', p.voidedAt && 'opacity-60')}>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  <span className="font-mono">{p.invoiceNumber}</span>
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {p.paidDate} · {METHOD_LABEL[p.method]}
                  </span>
                </p>
                {p.voidedAt && <p className="text-xs text-destructive">{t('voided_payment', { reason: p.voidReason ?? '' })}</p>}
              </div>
              <span className={cn('font-mono text-sm font-bold', p.voidedAt ? 'line-through' : 'text-chart-2')}>
                {fmtUSD(p.amountUSD)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
