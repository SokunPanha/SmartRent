import { Invoice, Room, Property, AppLanguage } from '@/lib/types';

export interface MonthlySummaryRow {
  month: number;
  monthLabel: string;
  rent: number;
  electricity: number;
  water: number;
  collected: number;
  total: number;
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
  monthlySummary: MonthlySummaryRow[];
  roomDetails: RoomRevenueRow[];
}

const MONTH_LABEL_KEYS: Record<number, string> = {
  4: 'month_april',
  5: 'month_may',
  6: 'month_june',
};

export function getReportData(
  invoices: Invoice[],
  rooms: Room[],
  properties: Property[],
  selectedYear: number,
  selectedProperty: string,
  lang: AppLanguage,
  t: (key: string) => string
): ReportData {
  const filteredInvoices = invoices.filter((inv) => {
    const yearMatch = inv.year === selectedYear;
    if (selectedProperty === 'all') return yearMatch;
    const room = rooms.find((r) => r.id === inv.roomId);
    return yearMatch && room && room.propertyId === selectedProperty;
  });

  const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmountUSD, 0);
  const totalCollected = filteredInvoices.reduce((sum, inv) => sum + inv.amountPaidUSD, 0);
  const totalOutstanding = totalInvoiced - totalCollected;

  const monthlySummary: MonthlySummaryRow[] = [4, 5, 6].map((m) => {
    const monthInvoices = filteredInvoices.filter((inv) => inv.month === m);
    const rent = monthInvoices.reduce((sum, inv) => sum + inv.rentAmountUSD, 0);
    const electricity = monthInvoices.reduce((sum, inv) => sum + inv.electricityCostUSD, 0);
    const water = monthInvoices.reduce((sum, inv) => sum + inv.waterCostUSD, 0);
    const collected = monthInvoices.reduce((sum, inv) => sum + inv.amountPaidUSD, 0);
    return {
      month: m,
      monthLabel: t(MONTH_LABEL_KEYS[m]),
      rent,
      electricity,
      water,
      collected,
      total: rent + electricity + water,
    };
  });

  const roomRevenueMap: Record<string, RoomRevenueRow> = {};
  filteredInvoices.forEach((inv) => {
    const room = rooms.find((r) => r.id === inv.roomId);
    if (!room) return;
    const prop = properties.find((p) => p.id === room.propertyId);
    const propName = prop ? (lang === 'en' ? prop.name : prop.nameKh) : 'Unknown';

    if (!roomRevenueMap[inv.roomId]) {
      roomRevenueMap[inv.roomId] = {
        roomNumber: room.roomNumber,
        propertyName: propName,
        totalPaid: 0,
        totalOwed: 0,
      };
    }
    roomRevenueMap[inv.roomId].totalPaid += inv.amountPaidUSD;
    roomRevenueMap[inv.roomId].totalOwed += inv.totalAmountUSD - inv.amountPaidUSD;
  });

  const roomDetails = Object.values(roomRevenueMap).sort((a, b) => b.totalPaid - a.totalPaid);

  return { totalInvoiced, totalCollected, totalOutstanding, monthlySummary, roomDetails };
}
