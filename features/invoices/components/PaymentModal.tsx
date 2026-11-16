'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Ban, Loader2, Printer, Receipt, Send } from 'lucide-react';
import { AppLanguage, Invoice, Payment, Property, Room, Tenant } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoicesController } from '../use-invoices-controller';
import { useInvoiceMutations, useInvoicePayments } from '../invoices.queries';
import { METHOD_LABEL, bi, fmtUSD } from '../invoice-document';
import { ReceiptPaper } from './ReceiptPaper';

type Controller = ReturnType<typeof useInvoicesController>;

/**
 * Payments for one invoice: record money received (with the date it was
 * received), see every payment made, print or send a receipt, and void a
 * mistaken payment (kept in the history with the reason).
 */
export function PaymentModal({
  c,
  invoice,
  tenant,
  room,
  property,
  canPay,
}: {
  c: Controller;
  invoice: Invoice | undefined;
  tenant: Tenant | undefined;
  room: Room | undefined;
  property: Property | undefined;
  canPay: boolean;
  lang: AppLanguage;
}) {
  const t = useTranslations('Invoices');
  const { data: payments = [], isLoading } = useInvoicePayments(c.showPaymentModal && invoice ? invoice.id : null);
  const { voidPayment, sendReceipt } = useInvoiceMutations();
  const [receiptFor, setReceiptFor] = useState<Payment | null>(null);
  const [voiding, setVoiding] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');

  if (!invoice) return null;
  const balance = Math.max(0, Number((invoice.totalAmountUSD - invoice.amountPaidUSD).toFixed(2)));
  const close = () => {
    setReceiptFor(null);
    setVoiding(null);
    c.closePaymentModal();
  };

  if (receiptFor) {
    return (
      <Modal open={c.showPaymentModal} onClose={close} className="max-w-xl max-h-[92vh]">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card px-5 py-3 print:hidden">
          <button
            onClick={() => setReceiptFor(null)}
            className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-foreground hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            {t('back')}
          </button>
          <button
            onClick={() => window.print()}
            className="flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            <Printer className="size-4" />
            {t('print_receipt')}
          </button>
        </div>
        <div className="bg-muted/60 p-3 sm:p-6 print:bg-white print:p-0">
          <ReceiptPaper
            payment={receiptFor}
            invoice={invoice}
            tenantName={bi(tenant?.nameKh, tenant?.name)}
            roomNumber={room?.roomNumber ?? '—'}
            property={property}
          />
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={c.showPaymentModal} onClose={close} size="md">
      <ModalHeader title={t('record_payment')} onClose={close} />

      <div className="space-y-5 p-4 md:p-5">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono font-semibold text-foreground">{invoice.invoiceNumber}</span>
          {' · '}
          {tenant?.name ?? '—'} · {room?.roomNumber ?? '—'}
        </p>

        <dl className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-3 text-center">
          {[
            [t('card_total'), fmtUSD(invoice.totalAmountUSD), ''],
            [t('paid'), fmtUSD(invoice.amountPaidUSD), 'text-chart-2'],
            [t('card_balance'), fmtUSD(balance), balance > 0 ? 'text-destructive' : ''],
          ].map(([label, value, tone]) => (
            <div key={label}>
              <dt className="text-[11px] text-muted-foreground">{label}</dt>
              <dd className={cn('font-mono text-base font-bold text-foreground', tone)}>{value}</dd>
            </div>
          ))}
        </dl>

        {balance > 0 && canPay && (
          <form onSubmit={c.handleSubmitPayment} className="space-y-4 rounded-2xl border border-border p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('pay_amount_label')} *</span>
                <input
                  type="number"
                  value={c.payAmount}
                  onChange={(e) => c.setPayAmount(Number(e.target.value))}
                  min={0.01}
                  max={balance}
                  step={0.01}
                  className="h-11 w-full rounded-xl border border-input bg-card px-4 font-mono text-sm font-bold focus:border-primary focus:outline-none"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('pay_date_label')} *</span>
                <input
                  type="date"
                  value={c.payDate}
                  onChange={(e) => c.setPayDate(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </label>
              <div>
                <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('pay_gateway_label')} *</span>
                <Select value={c.payMethod} onValueChange={(v) => c.setPayMethod(v as typeof c.payMethod)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['aba', 'cash', 'wing', 'other'] as const).map((m) => (
                      <SelectItem key={m} value={m}>
                        {METHOD_LABEL[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('pay_remarks_label')}</span>
                <input
                  type="text"
                  value={c.payNotes}
                  onChange={(e) => c.setPayNotes(e.target.value)}
                  placeholder={t('pay_remarks_placeholder')}
                  className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm focus:border-primary focus:outline-none"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={c.paySaving}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50"
            >
              {c.paySaving && <Loader2 className="size-4 animate-spin" />}
              {t('record_payment_button')}
            </button>
          </form>
        )}

        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">{t('payment_history')}</h4>
          {isLoading ? (
            <p className="text-xs text-muted-foreground">…</p>
          ) : payments.length === 0 ? (
            <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">{t('no_payments')}</p>
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {payments.map((p) => (
                <li key={p.id} className={cn('space-y-2 p-3', p.voidedAt && 'opacity-60')}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className={cn('font-mono text-sm font-bold text-foreground', p.voidedAt && 'line-through')}>
                        {fmtUSD(p.amountUSD)}
                        <span className="ml-2 font-sans text-xs font-medium text-muted-foreground">
                          {METHOD_LABEL[p.method]} · {p.paidDate}
                        </span>
                      </p>
                      {p.notes && <p className="truncate text-xs text-muted-foreground">{p.notes}</p>}
                      {p.voidedAt && (
                        <p className="text-xs font-medium text-destructive">
                          {t('voided')}: {p.voidReason}
                        </p>
                      )}
                    </div>
                    {!p.voidedAt && (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => setReceiptFor(p)}
                          title={t('receipt')}
                          aria-label={t('receipt')}
                          className="flex size-9 items-center justify-center rounded-full border border-border hover:bg-muted cursor-pointer"
                        >
                          <Receipt className="size-4" />
                        </button>
                        {tenant?.telegramChatId && (
                          <button
                            onClick={() => sendReceipt.mutate(p.id)}
                            disabled={sendReceipt.isPending}
                            title={t('send_receipt')}
                            aria-label={t('send_receipt')}
                            className="flex size-9 items-center justify-center rounded-full border border-border text-info hover:bg-info/10 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="size-4" />
                          </button>
                        )}
                        {canPay && p.method !== 'deposit' && (
                          <button
                            onClick={() => {
                              setVoiding(p.id);
                              setVoidReason('');
                            }}
                            title={t('void')}
                            aria-label={t('void')}
                            className="flex size-9 items-center justify-center rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Ban className="size-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {voiding === p.id && (
                    <form
                      className="flex flex-col gap-2 sm:flex-row"
                      onSubmit={(e) => {
                        e.preventDefault();
                        voidPayment.mutate(
                          { invoiceId: invoice.id, paymentId: p.id, reason: voidReason },
                          { onSuccess: () => setVoiding(null) }
                        );
                      }}
                    >
                      <input
                        autoFocus
                        value={voidReason}
                        onChange={(e) => setVoidReason(e.target.value)}
                        placeholder={t('void_reason_placeholder')}
                        className="h-10 flex-1 rounded-xl border border-input bg-card px-3 text-sm"
                        required
                      />
                      <button
                        type="submit"
                        disabled={voidPayment.isPending}
                        className="h-10 rounded-full bg-destructive px-4 text-sm font-semibold text-destructive-foreground cursor-pointer disabled:opacity-50"
                      >
                        {t('confirm_void')}
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  );
}
