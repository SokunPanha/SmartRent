import { useTranslations } from 'next-intl';
import { Printer, Trash2, X } from 'lucide-react';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';
import { useInvoiceMutations } from '../invoices.queries';
import { Invoice, Room, Tenant, Property, AppLanguage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/shared/Modal';
import { MonthOption } from '../invoices.helpers';
import { useSettings } from '@/features/settings/settings.queries';
import { paymentQrUrl } from '@/features/settings/settings.api';
import {
  Bilingual,
  DOC,
  STATUS_LABEL,
  bi,
  billingPeriod,
  fmtKHR,
  fmtUSD,
  invoiceIssuer,
  invoiceTitle,
  invoiceLines,
  invoiceTotals,
  paymentInfo,
} from '../invoice-document';

/** Field label: Khmer (primary) with English underneath. */
function Label({ b, className }: { b: Bilingual; className?: string }) {
  return (
    <span className={cn('block', className)}>
      <span className="block text-xs leading-[1.7] font-semibold text-[#4A4F57]">{b[0]}</span>
      {b[1] && <span className="block text-[10px] leading-tight text-[#9AA0A8]">{b[1]}</span>}
    </span>
  );
}

/** Value: Khmer (primary) with English underneath when it differs. */
function Value({ b, className, sub = 'text-xs' }: { b: Bilingual; className?: string; sub?: string }) {
  return (
    <span className={cn('block', className)}>
      <span className="block leading-[1.7]">{b[0]}</span>
      {b[1] && <span className={cn('block font-normal leading-snug text-[#6B7079]', sub)}>{b[1]}</span>}
    </span>
  );
}

const STATUS_STYLE: Record<Invoice['status'], string> = {
  paid: 'border-[#1F9D5C] text-[#1F9D5C] bg-[#E8F6EE]',
  partial: 'border-[#C28A12] text-[#94690A] bg-[#FBF3DD]',
  unpaid: 'border-[#D93D42] text-[#D93D42] bg-[#FDECEC]',
  overdue: 'border-[#D93D42] text-[#D93D42] bg-[#FDECEC]',
};

/**
 * Printable invoice — bilingual, Khmer first. The paper is always white with
 * dark ink (whatever the app theme) and prints alone on A4 (see the
 * `@media print` rules for #rental-invoice-print-area in globals.css).
 * Content comes from invoice-document.ts, shared with the Telegram image.
 */
export function PrintInvoiceModal({
  invoice,
  rooms,
  tenants,
  properties,
  onClose,
  canDelete = false,
}: {
  invoice: Invoice | null;
  rooms: Room[];
  tenants: Tenant[];
  properties: Property[];
  activeMonths: MonthOption[];
  onClose: () => void;
  lang: AppLanguage;
  canDelete?: boolean;
}) {
  const t = useTranslations('Invoices');
  const { data: settings } = useSettings();
  const confirm = useConfirm();
  const { deleteInvoice } = useInvoiceMutations();

  if (!invoice) return null;

  const room = rooms.find((r) => r.id === invoice.roomId);
  const property = properties.find((p) => p.id === room?.propertyId);
  const tenant = tenants.find((tn) => tn.id === invoice.tenantId);
  const propertyName = bi(property?.nameKh, property?.name);
  const issuer = invoiceIssuer(settings, property);
  const pay = paymentInfo(settings);
  const tenantName = bi(tenant?.nameKh, tenant?.name);
  const lines = invoiceLines(invoice);
  const totals = invoiceTotals(invoice);
  const status = STATUS_LABEL[invoice.status];
  const period = billingPeriod(invoice);
  const title = invoiceTitle(invoice.kind);

  // Only invoices with no money received can be deleted (e.g. to fix a
  // meter reading and regenerate); the server enforces this too.
  async function handleDelete() {
    if (!invoice) return;
    const ok = await confirm({
      title: t('delete_invoice_confirm', { number: invoice.invoiceNumber }),
      confirmLabel: t('delete_invoice'),
      variant: 'destructive',
    });
    if (ok) deleteInvoice.mutate(invoice.id, { onSuccess: onClose });
  }

  return (
    <Modal open={!!invoice} onClose={onClose} className="max-w-3xl max-h-[92vh]">
      {/* Toolbar (screen only) */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card px-5 py-3 print:hidden">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Printer className="size-4 text-primary" />
          {t('print_preview_voucher')}
        </h3>
        <div className="flex items-center gap-2">
          {canDelete && invoice.amountPaidUSD <= 0 && (
            <button
              onClick={handleDelete}
              disabled={deleteInvoice.isPending}
              aria-label={t('delete_invoice')}
              title={t('delete_invoice')}
              className="flex size-10 items-center justify-center rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="size-4" />
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_6px_16px_-6px_var(--primary)] transition hover:bg-primary/90 cursor-pointer"
          >
            <Printer className="size-4" />
            {t('print_invoice_button')}
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="bg-muted/60 p-3 sm:p-6 print:bg-white print:p-0">
        <article
          id="rental-invoice-print-area"
          className="mx-auto rounded-xl bg-white p-6 text-[#1B1C20] shadow-card sm:p-10"
        >
          {/* Header: issuer + document title */}
          <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4F5BEF] text-lg font-bold text-white">
                {(issuer.name[1] || issuer.name[0]).charAt(0)}
              </div>
              <div className="min-w-0">
                <Value b={issuer.name} className="text-lg font-bold" sub="text-sm" />
                {issuer.address[0] && (
                  <Value
                    b={issuer.address}
                    className="mt-1 max-w-xs text-xs text-[#4A4F57]"
                    sub="text-[11px]"
                  />
                )}
                {issuer.phone && (
                  <p className="mt-1 text-xs text-[#4A4F57]">
                    {DOC.phone[0]} / {DOC.phone[1]}: <span className="font-mono">{issuer.phone}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-3xl leading-[1.6] font-bold text-[#4F5BEF]">{title[0]}</p>
              <p className="text-sm font-semibold tracking-[0.2em] text-[#6B7079]">{title[1]}</p>
              <span
                className={cn(
                  'mt-3 inline-flex flex-col items-center rounded-md border-2 px-3 py-1 text-center',
                  STATUS_STYLE[invoice.status]
                )}
              >
                <span className="text-sm leading-[1.7] font-bold">{status[0]}</span>
                <span className="text-[10px] font-semibold tracking-wider">{status[1]}</span>
              </span>
            </div>
          </header>

          {/* Document details */}
          <dl className="mt-8 print:mt-5 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-[#F4F6F8] p-4 sm:grid-cols-4">
            {(
              [
                [DOC.invoiceNo, [invoice.invoiceNumber, ''] as Bilingual, true],
                [DOC.issued, [invoice.issueDate, ''] as Bilingual, true],
                [DOC.due, [invoice.dueDate, ''] as Bilingual, true],
                [DOC.period, period, false],
              ] as const
            ).map(([label, value, mono]) => (
              <div key={label[1]} className="min-w-0">
                <dt>
                  <Label b={label} />
                </dt>
                <dd className={cn('mt-1 text-sm font-semibold', mono && 'font-mono')}>
                  <Value b={value} />
                </dd>
              </div>
            ))}
          </dl>

          {/* Parties */}
          <section className="mt-8 print:mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <Label b={DOC.billTo} />
              <Value b={tenantName} className="mt-2 text-base font-bold" sub="text-sm" />
              {tenant?.phone && (
                <p className="mt-1 text-sm text-[#4A4F57]">
                  {DOC.phone[0]} / {DOC.phone[1]}: <span className="font-mono">{tenant.phone}</span>
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <Label b={DOC.room} />
              <p className="mt-2 text-base font-bold">{room?.roomNumber ?? '—'}</p>
              <p className="mt-0.5 text-sm text-[#4A4F57]">
                {DOC.floor[0]} / {DOC.floor[1]} {room?.floor ?? '—'}
              </p>
              {!issuer.isProperty && <Value b={propertyName} className="mt-0.5 text-sm text-[#4A4F57]" />}
            </div>
          </section>

          {/* Line items */}
          <div className="mt-8 print:mt-5 overflow-x-auto scroll-x-hint print:overflow-visible">
            <table className="w-full min-w-[540px] border-collapse text-sm print:min-w-0">
              <thead>
                <tr className="border-y-2 border-[#1B1C20]">
                  <th className="w-12 py-2.5 pr-2 text-left align-bottom">
                    <Label b={DOC.no} />
                  </th>
                  <th className="py-2.5 pr-3 text-left align-bottom">
                    <Label b={DOC.description} />
                  </th>
                  <th className="py-2.5 pr-3 text-right align-bottom">
                    <Label b={DOC.qty} />
                  </th>
                  <th className="py-2.5 pr-3 text-right align-bottom">
                    <Label b={DOC.unitPrice} />
                  </th>
                  <th className="py-2.5 text-right align-bottom">
                    <Label b={DOC.amount} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.no} className="border-b border-[#E3E7EB] align-top break-inside-avoid">
                    <td className="py-3 pr-2 font-mono text-[#6B7079]">{line.no}</td>
                    <td className="py-3 pr-3">
                      <Value b={line.title} className="font-semibold" />
                      {line.detail && (
                        <Value b={line.detail} className="mt-1 text-xs text-[#6B7079]" sub="text-[11px]" />
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">{line.qty}</td>
                    <td className="py-3 pr-3 text-right font-mono whitespace-nowrap text-[#4A4F57]">
                      {line.unitPrice}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold whitespace-nowrap">
                      {fmtUSD(line.amountUSD)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment note + totals */}
          <section className="mt-6 print:mt-4 grid gap-6 sm:grid-cols-[1fr_minmax(0,300px)] break-inside-avoid">
            <div className="order-2 space-y-3 text-xs text-[#4A4F57] sm:order-1">
              <div>
                <Label b={DOC.payment} />
                {pay && (
                  <div className="mt-2 flex items-start gap-4">
                    {pay.qrKey && (
                      <figure className="shrink-0 text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element -- authenticated API image */}
                        <img
                          src={paymentQrUrl(pay.qrKey)}
                          alt={DOC.scanToPay[1]}
                          className="size-28 print:size-24 rounded-lg border border-[#E3E7EB] bg-white object-contain p-1"
                        />
                        <figcaption className="mt-1 text-[10px] leading-tight">
                          <span className="block font-semibold text-[#1B1C20]">{DOC.scanToPay[0]}</span>
                          <span className="block text-[#9AA0A8]">{DOC.scanToPay[1]}</span>
                        </figcaption>
                      </figure>
                    )}
                    <dl className="min-w-0 space-y-1.5">
                      {(
                        [
                          [DOC.bank, pay.bankName, false],
                          [DOC.accountName, pay.accountName, false],
                          [DOC.accountNo, pay.accountNumber, true],
                        ] as const
                      )
                        .filter(([, v]) => v)
                        .map(([label, v, mono]) => (
                          <div key={label[1]}>
                            <dt className="text-[10px] leading-tight text-[#9AA0A8]">
                              {label[0]} / {label[1]}
                            </dt>
                            <dd className={cn('text-sm font-semibold text-[#1B1C20]', mono && 'font-mono')}>{v}</dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                )}
                <p className="mt-2 leading-relaxed text-[#1B1C20]">{DOC.paymentBody[0]}</p>
                <p className="mt-0.5 leading-relaxed">{DOC.paymentBody[1]}</p>
              </div>
              <p>
                {DOC.rate[0]} / {DOC.rate[1]}:{' '}
                <span className="font-mono font-semibold text-[#1B1C20]">
                  1 USD = {invoice.khmerExchangeRate.toLocaleString('en-US')} ៛
                </span>
              </p>
            </div>

            <div className="order-1 sm:order-2">
              <div className="flex items-center justify-between py-1.5 text-sm">
                <Label b={DOC.subtotal} />
                <span className="font-mono">{fmtUSD(totals.subtotalUSD)}</span>
              </div>
              {totals.paidUSD > 0 && (
                <div className="flex items-center justify-between py-1.5 text-sm">
                  <Label b={DOC.paid} />
                  <span className="font-mono text-[#1F9D5C]">− {fmtUSD(totals.paidUSD)}</span>
                </div>
              )}
              <div className="mt-2 rounded-xl bg-[#EEF0FE] px-4 py-3">
                <div className="flex items-end justify-between gap-3">
                  <span>
                    <span className="block text-sm leading-[1.7] font-bold text-[#3540C9]">{DOC.balance[0]}</span>
                    <span className="block text-[10px] text-[#3540C9]/80">{DOC.balance[1]}</span>
                  </span>
                  <span className="font-mono text-2xl font-bold text-[#3540C9]">{fmtUSD(totals.balanceUSD)}</span>
                </div>
                <p className="mt-1 text-right font-mono text-xs text-[#4A4F57]">≈ {fmtKHR(totals.balanceKHR)}</p>
              </div>
            </div>
          </section>

          {/* Signatures */}
          <section className="mt-14 print:mt-6 grid grid-cols-2 gap-10 text-center break-inside-avoid">
            {[DOC.landlordSig, DOC.tenantSig].map((b) => (
              <div key={b[1]}>
                <div className="mx-auto h-14 print:h-8 max-w-48 border-b border-[#1B1C20]" />
                <Label b={b} className="mt-2" />
              </div>
            ))}
          </section>

          <footer className="mt-10 print:mt-3 break-inside-avoid border-t border-[#E3E7EB] pt-4 print:pt-2 text-center text-xs text-[#6B7079]">
            <p className="text-[#4A4F57]">{DOC.thanks[0]}</p>
            <p className="mt-0.5 text-[11px]">{DOC.thanks[1]}</p>
          </footer>
        </article>
      </div>
    </Modal>
  );
}
