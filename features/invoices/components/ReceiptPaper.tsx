'use client';

import { Bilingual, DOC, METHOD_LABEL, fmtKHR, fmtUSD, invoiceIssuer } from '../invoice-document';
import { Invoice, Payment, Property } from '@/lib/types';
import { useSettings } from '@/features/settings/settings.queries';

function Row({ label, value, strong, mono }: { label: Bilingual; value: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E3E7EB] py-2.5">
      <span className="leading-tight">
        <span className="block text-xs leading-[1.7] font-semibold text-[#4A4F57]">{label[0]}</span>
        <span className="block text-[10px] text-[#9AA0A8]">{label[1]}</span>
      </span>
      <span className={`text-right text-sm ${strong ? 'text-lg font-bold' : 'font-semibold'} ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

/** Printable payment receipt (bilingual, Khmer first). Uses the same print
 *  area id as the invoice, so it prints alone on A4. */
export function ReceiptPaper({
  payment,
  invoice,
  tenantName,
  roomNumber,
  property,
}: {
  payment: Payment;
  invoice: Invoice;
  tenantName: Bilingual;
  roomNumber: string;
  property: Property | undefined;
}) {
  const { data: settings } = useSettings();
  const issuer = invoiceIssuer(settings, property);
  const balance = Math.max(0, invoice.totalAmountUSD - invoice.amountPaidUSD);
  const receiptNo = `RC-${payment.id.replace(/^pay-/, '').slice(-8).toUpperCase()}`;

  return (
    <article id="rental-invoice-print-area" className="mx-auto max-w-lg rounded-xl bg-white p-6 text-[#1B1C20] shadow-card sm:p-8">
      <header className="flex items-start justify-between gap-4 border-b-2 border-[#1B1C20] pb-4">
        <div className="min-w-0">
          <p className="text-base leading-[1.7] font-bold">{issuer.name[0]}</p>
          {issuer.name[1] && <p className="text-xs text-[#6B7079]">{issuer.name[1]}</p>}
          {issuer.phone && <p className="mt-1 text-xs text-[#4A4F57]">{issuer.phone}</p>}
        </div>
        <div className="text-right">
          <p className="text-xl leading-[1.7] font-bold text-[#1F9D5C]">{DOC.receiptTitle[0]}</p>
          <p className="text-[11px] font-semibold tracking-[0.15em] text-[#6B7079]">{DOC.receiptTitle[1]}</p>
        </div>
      </header>

      <div className="mt-2">
        <Row label={DOC.receiptNo} value={receiptNo} mono />
        <Row label={DOC.receivedOn} value={payment.paidDate} mono />
        <Row label={DOC.receivedFrom} value={tenantName[1] ? `${tenantName[0]} (${tenantName[1]})` : tenantName[0]} />
        <Row label={DOC.room} value={roomNumber} />
        <Row label={DOC.forInvoice} value={invoice.invoiceNumber} mono />
        <Row label={DOC.method} value={METHOD_LABEL[payment.method]} />
        <Row label={DOC.amountReceived} value={`${fmtUSD(payment.amountUSD)}  ≈ ${fmtKHR(payment.amountUSD * invoice.khmerExchangeRate)}`} strong mono />
        <Row
          label={balance > 0.005 ? DOC.balanceNow : DOC.paidInFull}
          value={balance > 0.005 ? fmtUSD(balance) : '✓'}
          mono
        />
      </div>

      {payment.notes && <p className="mt-3 text-xs text-[#4A4F57]">{payment.notes}</p>}

      <div className="mt-12 flex justify-end">
        <div className="w-48 text-center">
          <div className="h-10 border-b border-[#1B1C20]" />
          <p className="mt-1.5 text-xs leading-[1.7] font-semibold text-[#4A4F57]">{DOC.receivedBy[0]}</p>
          <p className="text-[10px] text-[#9AA0A8]">{DOC.receivedBy[1]}</p>
        </div>
      </div>
      <p className="mt-6 text-center text-[11px] text-[#6B7079]">
        {DOC.thanks[0]} · {DOC.thanks[1]}
      </p>
    </article>
  );
}
