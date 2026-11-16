import { Invoice, Room, Property, AppLanguage, Expense } from '@/lib/types';
import { pickLocale } from '@/lib/i18n';
import { getMonthName } from '@/features/invoices/invoices.helpers';
import type { PaymentRow } from '@/features/invoices/invoices.api';

export interface MonthlySummaryRow {
  month: number;
  monthLabel: string;
  /** Billed in invoices for this billing month. */
  rent: number;
  electricity: number;
  water: number;
  fees: number;
  total: number;
  /** Cash actually received this calendar month (by payment date). */
  received: number;
  expenses: number;
  net: number;
}

export interface RoomRevenueRow {
  roomNumber: string;
  propertyName: string;
  totalPaid: number;
  totalOwed: number;
}

export interface ReportData {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  totalExpenses: number;
  netProfit: number;
  monthlySummary: MonthlySummaryRow[];
  roomDetails: RoomRevenueRow[];
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Report figures for one year (optionally one building):
 *  - billed: from invoices of each billing month,
 *  - received: cash basis, from the payment ledger by the date money arrived
 *    (voided payments excluded; deposits applied at move-out included),
 *  - expenses and net (received − expenses).
 */
export function getReportData(
  invoices: Invoice[],
  payments: PaymentRow[],
  expenses: Expense[],
  rooms: Room[],
  properties: Property[],
  selectedYear: number,
  selectedProperty: string,
  lang: AppLanguage
): ReportData {
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const inBuilding = (roomId: string) =>
    selectedProperty === 'all' || roomById.get(roomId)?.propertyId === selectedProperty;

  const yearInvoices = invoices.filter((inv) => inv.year === selectedYear && inBuilding(inv.roomId));
  const yearPayments = payments.filter(
    (p) => !p.voidedAt && p.paidDate.startsWith(`${selectedYear}-`) && inBuilding(p.roomId)
  );
  const yearExpenses = expenses.filter(
    (e) =>
      e.date.startsWith(`${selectedYear}-`) &&
      (selectedProperty === 'all' || e.propertyId === selectedProperty)
  );

  const monthOf = (date: string) => Number(date.slice(5, 7));

  const monthlySummary: MonthlySummaryRow[] = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
    const inv = yearInvoices.filter((x) => x.month === m);
    const rent = inv.reduce((s, x) => s + x.rentAmountUSD, 0);
    const electricity = inv.reduce((s, x) => s + x.electricityCostUSD, 0);
    const water = inv.reduce((s, x) => s + x.waterCostUSD, 0);
    const total = inv.reduce((s, x) => s + x.totalAmountUSD, 0);
    const received = yearPayments.filter((p) => monthOf(p.paidDate) === m).reduce((s, p) => s + p.amountUSD, 0);
    const exp = yearExpenses.filter((e) => monthOf(e.date) === m).reduce((s, e) => s + e.amountUSD, 0);
    return {
      month: m,
      monthLabel: getMonthName(m, lang),
      rent: r2(rent),
      electricity: r2(electricity),
      water: r2(water),
      fees: r2(total - rent - electricity - water),
      total: r2(total),
      received: r2(received),
      expenses: r2(exp),
      net: r2(received - exp),
    };
  });

  const totalInvoiced = r2(yearInvoices.reduce((s, x) => s + x.totalAmountUSD, 0));
  const totalOutstanding = r2(yearInvoices.reduce((s, x) => s + Math.max(0, x.totalAmountUSD - x.amountPaidUSD), 0));
  const totalCollected = r2(yearPayments.reduce((s, p) => s + p.amountUSD, 0));
  const totalExpenses = r2(yearExpenses.reduce((s, e) => s + e.amountUSD, 0));

  const roomRevenueMap: Record<string, RoomRevenueRow> = {};
  yearInvoices.forEach((inv) => {
    const room = roomById.get(inv.roomId);
    if (!room) return;
    const prop = properties.find((p) => p.id === room.propertyId);
    const propName = prop ? pickLocale(lang, prop.name, prop.nameKh) : 'Unknown';
    if (!roomRevenueMap[inv.roomId]) {
      roomRevenueMap[inv.roomId] = { roomNumber: room.roomNumber, propertyName: propName, totalPaid: 0, totalOwed: 0 };
    }
    roomRevenueMap[inv.roomId].totalPaid += inv.amountPaidUSD;
    roomRevenueMap[inv.roomId].totalOwed += Math.max(0, inv.totalAmountUSD - inv.amountPaidUSD);
  });
  const roomDetails = Object.values(roomRevenueMap).sort((a, b) => b.totalPaid - a.totalPaid);

  return {
    totalInvoiced,
    totalCollected,
    totalOutstanding,
    totalExpenses,
    netProfit: r2(totalCollected - totalExpenses),
    monthlySummary,
    roomDetails,
  };
}
