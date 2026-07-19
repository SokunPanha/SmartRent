export interface Property {
  id: string;
  name: string;
  nameKh: string;
  type: 'apartment' | 'borey' | 'condo' | 'guesthouse';
  address: string;
  addressKh: string;
  totalRooms: number;
  // Per-zone utility price override (KHR). Null/undefined = use the system default.
  electricityRate?: number | null;
  waterRate?: number | null;
}

/** Single-row system-wide configuration: exchange rate + default utility prices. */
export interface SystemSettings {
  id: string;
  exchangeRateKhr: number;
  defaultElectricityRate: number; // KHR/kWh
  defaultWaterRate: number; // KHR/m3
  updatedAt: string;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  rentAmount: number; // in USD
  status: 'vacant' | 'occupied' | 'maintenance';
}

export interface Tenant {
  id: string;
  name: string;
  nameKh: string;
  phone: string;
  nationalId: string;
  email?: string;
  checkInDate: string;
  emergencyContact: string;
  telegramChatId?: string;
  telegramAutoSend?: boolean;
}

export interface Contract {
  id: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number; // in USD
  depositAmount: number; // in USD
  electricityRate: number; // KHR / kWh (e.g. 1000 KHR)
  waterRate: number; // KHR / m3 (e.g. 2000 KHR)
  status: 'active' | 'suspended' | 'expired';
}

export interface MeterReading {
  id: string;
  roomId: string;
  readingDate: string; // YYYY-MM-DD
  year: number;
  month: number;
  prevElectricityValue: number;
  currElectricityValue: number;
  prevWaterValue: number;
  currWaterValue: number;
  recordedBy: string; // e.g. "Staff Name"
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  roomId: string;
  tenantId: string;
  year: number;
  month: number;
  issueDate: string;
  dueDate: string;
  
  // Base Rent
  rentAmountUSD: number;
 
  // Utilities consumed
  electricityPrev: number;
  electricityCurr: number;
  electricityRateKHR: number; // 1000 KHR/kWh
  electricityCostKHR: number;
  electricityCostUSD: number;
 
  waterPrev: number;
  waterCurr: number;
  waterRateKHR: number; // 2000 KHR/m3
  waterCostKHR: number;
  waterCostUSD: number;
 
  // Totals
  totalAmountUSD: number;
  totalAmountKHR: number;
  amountPaidUSD: number; // can record partial payment
  status: 'unpaid' | 'paid' | 'partial' | 'overdue';
  khmerExchangeRate: number; // e.g. 4100 KHR = 1 USD
  paidDate?: string;
  paymentMethod?: 'cash' | 'aba' | 'wing' | 'other';
  notes?: string;

  // Telegram delivery properties
  telegramScheduledDate?: string;
  telegramSentDate?: string;
  telegramStatus?: 'unscheduled' | 'scheduled' | 'sent' | 'failed';
  telegramError?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  actionKh: string;
  details: string;
  detailsKh: string;
  username: string;
  role: string; // role name at the time of the action
}

/** A role name. Roles are dynamic (super-admin defined), so this is a string. */
export type UserRole = string;
export type AppLanguage = 'en' | 'kh';
