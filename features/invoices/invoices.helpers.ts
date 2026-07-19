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

/** Builds the HTML message body sent to a tenant over Telegram. */
export function generateTelegramInvoiceHTML(
  inv: Invoice,
  tenantName: string,
  roomName: string,
  lang: AppLanguage
): string {
  const elecUnits = inv.electricityCurr - inv.electricityPrev;
  const waterUnits = inv.waterCurr - inv.waterPrev;
  const feeLines = inv.feeLines ?? [];
  const feeLinesKh = feeLines
    .map((f) => `\n• ${f.nameKh}៖ ${f.amountUSD.toFixed(2)} (៛${f.amountKHR.toLocaleString()})`)
    .join('');
  const feeLinesEn = feeLines
    .map((f) => `\n• ${f.name}: ${f.amountUSD.toFixed(2)} (≈ ${f.amountKHR.toLocaleString()} KHR)`)
    .join('');

  if (lang === 'kh') {
    return `<b>🔔 វិក្កយបត្រថ្លៃឈ្នួលបន្ទប់សរុប (ខែ${getMonthName(inv.month, 'kh')} ${inv.year})</b>
----------------------------------
<b>🏢 បន្ទប់៖</b> ${roomName}
<b>👤 អតិថិជន៖</b> ${tenantName}
<b>📅 ថ្ងៃចេញវិក្កយបត្រ៖</b> ${inv.issueDate}
<b>⏰ កាលកំណត់បង់ប្រាក់៖</b> ${inv.dueDate}
----------------------------------
<b>💰 សេចក្តីលម្អិតអំពីការគិតប្រាក់៖</b>
• ថ្លៃឈ្នួលបន្ទប់មូលដ្ឋាន៖ ${inv.rentAmountUSD}
• ថ្លៃអគ្គិសនី (${elecUnits} kWh): ${inv.electricityCostUSD.toFixed(2)} (៛${inv.electricityCostKHR.toLocaleString()})
• ថ្លៃទឹកប្រើប្រាស់ (${waterUnits} m³): ${inv.waterCostUSD.toFixed(2)} (៛${inv.waterCostKHR.toLocaleString()})${feeLinesKh}
----------------------------------
<b>💵 ចំនួនទឹកប្រាក់ត្រូវទូទាត់សរុប៖</b>
<b>${inv.totalAmountUSD.toFixed(2)} USD</b> (≈ ៛${inv.totalAmountKHR.toLocaleString()})
----------------------------------
<i>សូមទូទាត់ប្រាក់តាមរយៈ ABA QR ឬសាច់ប្រាក់មុនថ្ងៃកំណត់។ សូមអរគុណ! 🙏</i>`;
  }

  return `<b>🔔 MONTHLY RENTAL INVOICE</b>
----------------------------------
<b>🏢 Room Unit:</b> ${roomName}
<b>👤 Tenant Name:</b> ${tenantName}
<b>📅 Billing Cycle:</b> ${getMonthName(inv.month, 'en')} ${inv.year}
<b>📅 Issue Date:</b> ${inv.issueDate}
<b>⏰ Grand Due Date:</b> ${inv.dueDate}
----------------------------------
<b>💰 Detailed Breakdown:</b>
• Base Apartment Rent: ${inv.rentAmountUSD}
• Electricity Outlay (${elecUnits} kWh): ${inv.electricityCostUSD.toFixed(2)} (≈ ${inv.electricityCostKHR.toLocaleString()} KHR)
• Clean Water Outlay (${waterUnits} m³): ${inv.waterCostUSD.toFixed(2)} (≈ ${inv.waterCostKHR.toLocaleString()} KHR)${feeLinesEn}
----------------------------------
<b>💵 TOTAL AMOUNT DUE:</b>
<b>${inv.totalAmountUSD.toFixed(2)} USD</b> (≈ ${inv.totalAmountKHR.toLocaleString()} KHR)
----------------------------------
<i>Please process your payment using ABA QR or Cash prior to the due date. Thank you! 🙏</i>`;
}
