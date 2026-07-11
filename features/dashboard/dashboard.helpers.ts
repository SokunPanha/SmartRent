import { Property, Room, Contract, Invoice } from '@/lib/types';

/** Fixed "today" the seeded dataset is built around. */
export const SIMULATION_DATE = new Date('2026-06-15');

export interface DashboardStats {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  maintenanceRooms: number;
  juneRevenueInvoiced: number;
  juneRevenueCollected: number;
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

  const juneInvoices = invoices.filter((inv) => inv.year === 2026 && inv.month === 6);
  const juneRevenueInvoiced = juneInvoices.reduce((sum, inv) => sum + inv.totalAmountUSD, 0);
  const juneRevenueCollected = juneInvoices.reduce((sum, inv) => sum + inv.amountPaidUSD, 0);

  const totalOutstanding = invoices.reduce((sum, inv) => {
    const unpaid = inv.totalAmountUSD - inv.amountPaidUSD;
    return sum + (unpaid > 0 ? unpaid : 0);
  }, 0);

  const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;

  // Active contracts ending within ~35 days of the simulation date.
  const soonExpiryDate = new Date('2026-07-20');
  const contractsExpiringSoon = contracts.filter((c) => {
    if (c.status !== 'active') return false;
    const end = new Date(c.endDate);
    return end >= SIMULATION_DATE && end <= soonExpiryDate;
  }).length;

  return {
    totalProperties: properties.length,
    totalRooms: rooms.length,
    occupiedRooms,
    vacantRooms,
    maintenanceRooms,
    juneRevenueInvoiced,
    juneRevenueCollected,
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

const MONTH_LABEL_KEYS: Record<number, string> = {
  4: 'month_4',
  5: 'month_5',
  6: 'month_6',
};

/** Invoiced vs collected totals for April–June 2026. */
export function getMonthlyRevenue(
  invoices: Invoice[],
  t: (key: string) => string
): MonthlyRevenuePoint[] {
  return [4, 5, 6].map((m) => {
    const monthInvoices = invoices.filter((inv) => inv.year === 2026 && inv.month === m);
    return {
      label: t(MONTH_LABEL_KEYS[m]),
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
