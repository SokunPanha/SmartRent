import { Invoice, Room, Tenant, Property, AppLanguage } from '@/lib/types';
import { pickLocale } from '@/lib/i18n';

export interface MonthOption {
  value: number;
  label: string;
}

/** All twelve calendar months, labelled via the `month_N` message keys. Used
 *  for the month filter dropdown, the generate-period picker, and resolving a
 *  month number to its display label anywhere an invoice is shown. */
export function getActiveMonths(t: (key: string) => string): MonthOption[] {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: t(`month_${i + 1}`),
  }));
}

// Bilingual month names for contexts without access to the next-intl `t`
// function — notably the Telegram message body, which is assembled as raw
// content rather than UI chrome. Index 0 is unused so month N maps to [N].
const MONTH_NAMES: Record<AppLanguage, string[]> = {
  en: [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  kh: [
    '', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
  ],
};

/** Resolves a 1-based month number to its localized name (falls back to the
 *  raw number for out-of-range values). */
export function getMonthName(month: number, lang: AppLanguage): string {
  return MONTH_NAMES[lang][month] ?? String(month);
}

export function getRoomNameByInvoice(
  inv: Invoice,
  rooms: Room[],
  properties: Property[],
  lang: AppLanguage
): string {
  const room = rooms.find((r) => r.id === inv.roomId);
  if (!room) return 'Unknown';
  const prop = properties.find((p) => p.id === room.propertyId);
  return `${room.roomNumber} (${pickLocale(lang, prop?.name, prop?.nameKh)})`;
}

export function getTenantNameByInvoice(inv: Invoice, tenants: Tenant[], lang: AppLanguage): string {
  const tItem = tenants.find((tIdx) => tIdx.id === inv.tenantId);
  return tItem ? pickLocale(lang, tItem.name, tItem.nameKh) : 'Unknown';
}

const escapeHtml = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const money = (v: number) =>
  '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Short HTML caption sent under the invoice image on Telegram — the image
 *  carries the full breakdown, so this is just the recap. Bilingual, Khmer
 *  first (always, regardless of the staff member's UI language). */
export function generateTelegramInvoiceCaption(inv: Invoice, roomNumber: string): string {
  const khr = Math.round(inv.totalAmountKHR).toLocaleString('en-US');
  const balance = Math.max(0, inv.totalAmountUSD - inv.amountPaidUSD);
  const partial = inv.amountPaidUSD > 0 && inv.status !== 'paid';
  const room = escapeHtml(roomNumber);
  const no = escapeHtml(inv.invoiceNumber);
  const due = escapeHtml(inv.dueDate);

  return [
    `🧾 <b>វិក្កយបត្រ ${no}</b> · ខែ${getMonthName(inv.month, 'kh')} ${inv.year}`,
    `🏠 បន្ទប់ ${room}`,
    `💵 សរុប៖ <b>${money(inv.totalAmountUSD)}</b> (≈ ${khr} ៛)`,
    ...(partial ? [`✅ បានបង់ ${money(inv.amountPaidUSD)} · នៅសល់ <b>${money(balance)}</b>`] : []),
    `⏰ ថ្ងៃផុតកំណត់៖ ${due}`,
    'សូមទូទាត់មុនថ្ងៃផុតកំណត់។ សូមអរគុណ! 🙏',
    '',
    `<i>Invoice ${no} · ${getMonthName(inv.month, 'en')} ${inv.year} · Room ${room}</i>`,
    `<i>Total ${money(inv.totalAmountUSD)}${partial ? ` · Balance ${money(balance)}` : ''} · Due ${due}</i>`,
    '<i>Please pay before the due date. Thank you!</i>',
  ].join('\n');
}
