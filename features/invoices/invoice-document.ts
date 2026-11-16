import { Invoice, Payment, Property, SystemSettings } from '@/lib/types';
import { getMonthName } from './invoices.helpers';

/**
 * Single source of truth for what an invoice *document* says — used by the
 * printable invoice (PrintInvoiceModal), the Telegram invoice image
 * (invoice-image.ts) and the Telegram caption, so all three always match.
 *
 * Every invoice is bilingual with KHMER FIRST: Khmer is the primary line,
 * English the secondary one underneath. This is independent of the staff
 * member's UI language.
 */

/** [Khmer, English] — Khmer is always the primary text. */
export type Bilingual = readonly [kh: string, en: string];

export const DOC = {
  title: ['វិក្កយបត្រ', 'INVOICE'],
  invoiceNo: ['លេខវិក្កយបត្រ', 'Invoice no.'],
  issued: ['ថ្ងៃចេញ', 'Issue date'],
  due: ['ថ្ងៃផុតកំណត់', 'Due date'],
  period: ['ខែគិតប្រាក់', 'Billing period'],
  billTo: ['ជូនចំពោះ', 'Bill to'],
  room: ['បន្ទប់', 'Room'],
  floor: ['ជាន់', 'Floor'],
  phone: ['ទូរស័ព្ទ', 'Phone'],
  no: ['ល.រ', '#'],
  description: ['ការពិពណ៌នា', 'Description'],
  qty: ['បរិមាណ', 'Qty'],
  unitPrice: ['តម្លៃឯកតា', 'Unit price'],
  amount: ['ទឹកប្រាក់ (ដុល្លារ)', 'Amount (USD)'],
  rent: ['ថ្លៃឈ្នួលបន្ទប់', 'Room rent'],
  electricity: ['ថ្លៃអគ្គិសនី', 'Electricity'],
  water: ['ថ្លៃទឹក', 'Water'],
  meter: ['កុងទ័រ', 'Meter'],
  subtotal: ['សរុបរង', 'Subtotal'],
  paid: ['បានបង់', 'Amount paid'],
  balance: ['ទឹកប្រាក់ត្រូវបង់', 'Balance due'],
  rate: ['អត្រាប្តូរប្រាក់', 'Exchange rate'],
  payment: ['ការទូទាត់', 'Payment'],
  bank: ['ធនាគារ', 'Bank'],
  accountName: ['ឈ្មោះគណនី', 'Account name'],
  accountNo: ['លេខគណនី', 'Account no.'],
  scanToPay: ['ស្កេនដើម្បីបង់', 'Scan to pay'],
  paymentBody: [
    'សូមទូទាត់តាម ABA ឬសាច់ប្រាក់ មុនថ្ងៃផុតកំណត់ ដោយបញ្ជាក់លេខវិក្កយបត្រ។',
    'Please pay by ABA transfer or cash before the due date, quoting the invoice number.',
  ],
  landlordSig: ['ម្ចាស់ផ្ទះ', 'Landlord'],
  tenantSig: ['អ្នកជួល', 'Tenant'],
  thanks: ['សូមអរគុណចំពោះការទូទាត់។', 'Thank you for your payment.'],
  month: ['ខែ', 'month'],
  days: ['ថ្ងៃ', 'days'],
  moveInTitle: ['វិក្កយបត្រចូលស្នាក់នៅ', 'MOVE-IN INVOICE'],
  finalTitle: ['វិក្កយបត្រចុងក្រោយ', 'FINAL INVOICE'],
  receiptTitle: ['បង្កាន់ដៃទទួលប្រាក់', 'PAYMENT RECEIPT'],
  receiptNo: ['លេខបង្កាន់ដៃ', 'Receipt no.'],
  receivedFrom: ['ទទួលពី', 'Received from'],
  receivedOn: ['ថ្ងៃទទួល', 'Date received'],
  amountReceived: ['ទឹកប្រាក់ទទួល', 'Amount received'],
  method: ['វិធីបង់', 'Payment method'],
  forInvoice: ['សម្រាប់វិក្កយបត្រ', 'For invoice'],
  balanceNow: ['នៅសល់ត្រូវបង់ (បច្ចុប្បន្ន)', 'Balance remaining (as of today)'],
  paidInFull: ['បានបង់គ្រប់ចំនួន', 'Paid in full'],
  receivedBy: ['អ្នកទទួលប្រាក់', 'Received by'],
} as const satisfies Record<string, Bilingual>;

/** Document title by invoice kind. */
export function invoiceTitle(kind: string | undefined): Bilingual {
  if (kind === 'move_in') return DOC.moveInTitle;
  if (kind === 'final') return DOC.finalTitle;
  return DOC.title;
}

export const STATUS_LABEL: Record<Invoice['status'], Bilingual> = {
  unpaid: ['មិនទាន់បង់', 'UNPAID'],
  partial: ['បង់បានខ្លះ', 'PARTIALLY PAID'],
  paid: ['បានបង់រួច', 'PAID'],
  overdue: ['ហួសកំណត់', 'OVERDUE'],
};

/** Khmer value with its English counterpart (English omitted if identical). */
export function bi(kh: string | undefined | null, en: string | undefined | null): Bilingual {
  const k = (kh || en || '').trim();
  const e = (en || '').trim();
  return [k, e && e !== k ? e : ''];
}

export interface DocLine {
  no: number;
  title: Bilingual;
  detail?: Bilingual;
  qty: string;
  unitPrice: string;
  amountUSD: number;
}

export const fmtUSD = (v: number) =>
  '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtKHR = (v: number) => Math.round(v).toLocaleString('en-US') + ' ៛';
const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;

export function billingPeriod(inv: Invoice): Bilingual {
  return [`ខែ${getMonthName(inv.month, 'kh')} ${inv.year}`, `${getMonthName(inv.month, 'en')} ${inv.year}`];
}

/** The invoice's line items, numbered, in document order. */
export function invoiceLines(inv: Invoice): DocLine[] {
  const elecUnits = inv.electricityCurr - inv.electricityPrev;
  const waterUnits = inv.waterCurr - inv.waterPrev;
  const meter = (prev: number, curr: number): Bilingual => [
    `${DOC.meter[0]} ${prev} → ${curr}`,
    `${DOC.meter[1]} ${prev} → ${curr}`,
  ];
  const lines: Omit<DocLine, 'no'>[] = [
    // Rent line: full month, or prorated "15/30 days" for move-in/out months.
    ...(inv.rentAmountUSD > 0 || inv.kind !== 'final'
      ? [
          inv.rentDays && inv.periodDays
            ? {
                title: DOC.rent,
                detail: [
                  `${billingPeriod(inv)[0]} · ${inv.rentDays}/${inv.periodDays} ${DOC.days[0]}`,
                  `${billingPeriod(inv)[1]} · ${inv.rentDays}/${inv.periodDays} ${DOC.days[1]}`,
                ] as Bilingual,
                qty: `${inv.rentDays}/${inv.periodDays} ${DOC.days[0]}`,
                unitPrice: fmtUSD(round2((inv.rentAmountUSD * inv.periodDays) / inv.rentDays)),
                amountUSD: inv.rentAmountUSD,
              }
            : {
                title: DOC.rent,
                detail: billingPeriod(inv),
                qty: `1 ${DOC.month[0]}`,
                unitPrice: fmtUSD(inv.rentAmountUSD),
                amountUSD: inv.rentAmountUSD,
              },
        ]
      : []),
    // Utilities (none on a move-in invoice).
    ...(inv.kind === 'move_in'
      ? []
      : [
    {
      title: DOC.electricity,
      detail: meter(inv.electricityPrev, inv.electricityCurr),
      qty: `${elecUnits} kWh`,
      unitPrice: fmtKHR(inv.electricityRateKHR),
      amountUSD: inv.electricityCostUSD,
    },
    {
      title: DOC.water,
      detail: meter(inv.waterPrev, inv.waterCurr),
      qty: `${waterUnits} m³`,
      unitPrice: fmtKHR(inv.waterRateKHR),
      amountUSD: inv.waterCostUSD,
    },
        ]),
    ...(inv.feeLines ?? []).map((f) => ({
      title: bi(f.nameKh, f.name),
      qty: '1',
      unitPrice: fmtUSD(f.amountUSD),
      amountUSD: f.amountUSD,
    })),
  ];
  return lines.map((l, i) => ({ ...l, no: i + 1 }));
}

export function invoiceTotals(inv: Invoice) {
  const balanceUSD = Math.max(0, inv.totalAmountUSD - inv.amountPaidUSD);
  return {
    subtotalUSD: inv.totalAmountUSD,
    paidUSD: inv.amountPaidUSD,
    balanceUSD,
    balanceKHR: Math.round(balanceUSD * inv.khmerExchangeRate),
  };
}

/** Who issues the invoice: the business from System Settings when its name
 *  is set, otherwise the building itself. */
export interface InvoiceIssuer {
  name: Bilingual;
  address: Bilingual;
  phone: string;
  /** True when the issuer is the building (no business name configured). */
  isProperty: boolean;
}

export function invoiceIssuer(settings: SystemSettings | undefined, property: Property | undefined): InvoiceIssuer {
  if (settings && (settings.businessNameKh || settings.businessName)) {
    return {
      name: bi(settings.businessNameKh, settings.businessName),
      address: bi(settings.businessAddressKh, settings.businessAddress),
      phone: settings.businessPhone ?? '',
      isProperty: false,
    };
  }
  return {
    name: bi(property?.nameKh, property?.name),
    address: bi(property?.addressKh, property?.address),
    phone: settings?.businessPhone ?? '',
    isProperty: true,
  };
}

/** Bank account + QR tenants pay into; null when nothing is configured. */
export interface PaymentInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrKey: string | null;
}

export function paymentInfo(settings: SystemSettings | undefined): PaymentInfo | null {
  if (!settings) return null;
  const info = {
    bankName: settings.bankName ?? '',
    accountName: settings.bankAccountName ?? '',
    accountNumber: settings.bankAccountNumber ?? '',
    qrKey: settings.paymentQrKey ?? null,
  };
  return info.bankName || info.accountName || info.accountNumber || info.qrKey ? info : null;
}

export const METHOD_LABEL: Record<Payment['method'], string> = {
  aba: 'ABA',
  cash: 'សាច់ប្រាក់ / Cash',
  wing: 'វីង / Wing',
  other: 'ផ្សេងៗ / Other',
  deposit: 'ប្រាក់កក់ / Deposit',
};
