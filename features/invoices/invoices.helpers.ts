import { Invoice, Room, Tenant, Property, AppLanguage } from '@/lib/types';

export interface MonthOption {
  value: number;
  label: string;
}

export function getActiveMonths(lang: AppLanguage): MonthOption[] {
  return [
    { value: 4, label: lang === 'en' ? 'April' : 'មេសា' },
    { value: 5, label: lang === 'en' ? 'May' : 'ឧសភា' },
    { value: 6, label: lang === 'en' ? 'June' : 'មិថុនា' },
  ];
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
  return `${room.roomNumber} (${lang === 'en' ? prop?.name : prop?.nameKh})`;
}

export function getTenantNameByInvoice(inv: Invoice, tenants: Tenant[], lang: AppLanguage): string {
  const tItem = tenants.find((tIdx) => tIdx.id === inv.tenantId);
  return tItem ? (lang === 'en' ? tItem.name : tItem.nameKh) : 'Unknown';
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

  if (lang === 'kh') {
    return `<b>🔔 វិក្កយបត្រថ្លៃឈ្នួលបន្ទប់សរុប (ខែ${inv.month === 6 ? 'មិថុនា' : inv.month === 5 ? 'ឧសភា' : inv.month})</b>
----------------------------------
<b>🏢 បន្ទប់៖</b> ${roomName}
<b>👤 អតិថិជន៖</b> ${tenantName}
<b>📅 ថ្ងៃចេញវិក្កយបត្រ៖</b> ${inv.issueDate}
<b>⏰ កាលកំណត់បង់ប្រាក់៖</b> ${inv.dueDate}
----------------------------------
<b>💰 សេចក្តីលម្អិតអំពីការគិតប្រាក់៖</b>
• ថ្លៃឈ្នួលបន្ទប់មូលដ្ឋាន៖ ${inv.rentAmountUSD}
• ថ្លៃអគ្គិសនី (${elecUnits} kWh): ${inv.electricityCostUSD.toFixed(2)} (៛${inv.electricityCostKHR.toLocaleString()})
• ថ្លៃទឹកប្រើប្រាស់ (${waterUnits} m³): ${inv.waterCostUSD.toFixed(2)} (៛${inv.waterCostKHR.toLocaleString()})
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
<b>📅 Billing Cycle:</b> June ${inv.year}
<b>📅 Issue Date:</b> ${inv.issueDate}
<b>⏰ Grand Due Date:</b> ${inv.dueDate}
----------------------------------
<b>💰 Detailed Breakdown:</b>
• Base Apartment Rent: ${inv.rentAmountUSD}
• Electricity Outlay (${elecUnits} kWh): ${inv.electricityCostUSD.toFixed(2)} (≈ ${inv.electricityCostKHR.toLocaleString()} KHR)
• Clean Water Outlay (${waterUnits} m³): ${inv.waterCostUSD.toFixed(2)} (≈ ${inv.waterCostKHR.toLocaleString()} KHR)
----------------------------------
<b>💵 TOTAL AMOUNT DUE:</b>
<b>${inv.totalAmountUSD.toFixed(2)} USD</b> (≈ ${inv.totalAmountKHR.toLocaleString()} KHR)
----------------------------------
<i>Please process your payment using ABA QR or Cash prior to the due date. Thank you! 🙏</i>`;
}
