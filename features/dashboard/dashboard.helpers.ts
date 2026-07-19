import { Property, Room, Contract, Invoice } from '@/lib/types';

export interface DashboardStats {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  maintenanceRooms: number;
  currentMonthRevenueInvoiced: number;
  currentMonthRevenueCollected: number;
  totalOutstanding: number;
  overdueCount: number;
  contractsExpiringSoon: number;
}

export function getDashboardStats(
  properties: Property[],
  rooms: Room[],
  contracts: Contract[],
  invoices: Invoice[]
): DashboardStats {
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const vacantRooms = rooms.filter((r) => r.status === 'vacant').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;

  const currentMonthInvoices = invoices.filter(
    (inv) => inv.year === curYear && inv.month === curMonth
  );
  const currentMonthRevenueInvoiced = currentMonthInvoices.reduce(
    (sum, inv) => sum + inv.totalAmountUSD,
    0
  );
  const currentMonthRevenueCollected = currentMonthInvoices.reduce(
    (sum, inv) => sum + inv.amountPaidUSD,
    0
  );

  const totalOutstanding = invoices.reduce((sum, inv) => {
    const unpaid = inv.totalAmountUSD - inv.amountPaidUSD;
    return sum + (unpaid > 0 ? unpaid : 0);
  }, 0);

  const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;

  // Active contracts ending within ~35 days from today.
  const soonExpiryDate = new Date(now);
  soonExpiryDate.setDate(soonExpiryDate.getDate() + 35);
  const contractsExpiringSoon = contracts.filter((c) => {
    if (c.status !== 'active') return false;
    const end = new Date(c.endDate);
    return end >= now && end <= soonExpiryDate;
  }).length;

  return {
    totalProperties: properties.length,
    totalRooms: rooms.length,
    occupiedRooms,
    vacantRooms,
    maintenanceRooms,
    currentMonthRevenueInvoiced,
    currentMonthRevenueCollected,
    totalOutstanding,
    overdueCount,
    contractsExpiringSoon,
  };
}

export interface MonthlyRevenuePoint {
  label: string;
  invoiced: number;
  collected: number;
}

/** Invoiced vs collected totals for the trailing three months ending with the
 *  current calendar month (oldest first). Month arithmetic via Date handles
 *  year boundaries (e.g. January → the prior November/December). */
export function getMonthlyRevenue(
  invoices: Invoice[],
  t: (key: string) => string
): MonthlyRevenuePoint[] {
  const now = new Date();
  return [2, 1, 0].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthInvoices = invoices.filter((inv) => inv.year === year && inv.month === month);
    return {
      label: t(`month_${month}`),
      invoiced: Math.round(monthInvoices.reduce((sum, inv) => sum + inv.totalAmountUSD, 0)),
      collected: Math.round(monthInvoices.reduce((sum, inv) => sum + inv.amountPaidUSD, 0)),
    };
  });
}

/** Donut percentages for the occupancy chart. */
export function getOccupancyBreakdown(stats: DashboardStats) {
  const total = stats.totalRooms || 1;
  return {
    occupiedPct: Math.round((stats.occupiedRooms / total) * 100),
    vacantPct: Math.round((stats.vacantRooms / total) * 100),
    maintPct: Math.round((stats.maintenanceRooms / total) * 100),
  };
}
