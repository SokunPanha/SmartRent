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
  // Business & payment details printed on every invoice (all optional).
  businessName?: string | null;
  businessNameKh?: string | null;
  businessPhone?: string | null;
  businessAddress?: string | null;
  businessAddressKh?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  /** Storage key of the payment QR (view via /api/settings/payment-qr). */
  paymentQrKey?: string | null;
  /** Day of the billing month invoices are issued / due (1–28). */
  invoiceIssueDay: number;
  invoiceDueDay: number;
  /** Day of month this month's invoices are auto-sent on Telegram (null = off). */
  telegramSendDay?: number | null;
  overdueRemindersEnabled: boolean;
  reminderIntervalDays: number;
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
  /** Storage key of the photo of the back of the ID card (view via
   *  nationalIdImageUrl). */
  nationalIdBack?: string | null;
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
  /** Custom KHR rates for this lease; null = follow the building/system rate. */
  electricityRate: number | null;
  waterRate: number | null;
  /** active = billed monthly · suspended = still occupies, billing paused ·
   *  expired = ended (automatically after endDate, or via move-out). */
  status: 'active' | 'suspended' | 'expired';
  moveOutDate?: string | null;
  depositStatus?: 'pending' | 'held' | 'settled';
  depositDeductionUSD?: number | null;
  depositAppliedUSD?: number | null;
  depositRefundUSD?: number | null;
  depositNote?: string | null;
  depositSettledDate?: string | null;
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
  /** 'regular' monthly reading, or 'final' (move-out). */
  kind?: 'regular' | 'final';
}

/** A custom flat fee applied to an invoice (snapshot at generation time). */
export interface InvoiceFeeLine {
  name: string;
  nameKh: string;
  amountUSD: number;
  amountKHR: number;
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

  // Custom flat fees (trash, parking, …) applied on top of rent + utilities.
  feeLines?: InvoiceFeeLine[];

  // Telegram delivery properties
  telegramScheduledDate?: string;
  telegramSentDate?: string;
  telegramStatus?: 'unscheduled' | 'scheduled' | 'sent' | 'failed';
  telegramError?: string;

  /** monthly (generator) · move_in (deposit + first rent) · final (move-out) */
  kind?: 'monthly' | 'move_in' | 'final';
  /** Rent proration: days billed out of days in the month (null = full). */
  rentDays?: number | null;
  periodDays?: number | null;
}

/** One payment received against an invoice (the ledger). */
export interface Payment {
  id: string;
  invoiceId: string;
  amountUSD: number;
  method: 'cash' | 'aba' | 'wing' | 'other' | 'deposit';
  notes?: string | null;
  paidDate: string;
  recordedBy?: string | null;
  createdAt: string;
  voidedAt?: string | null;
  voidedBy?: string | null;
  voidReason?: string | null;
}

export type ExpenseCategory = 'repair' | 'cleaning' | 'utilities' | 'tax' | 'salary' | 'other';

export interface Expense {
  id: string;
  propertyId: string | null;
  date: string;
  category: ExpenseCategory;
  description: string;
  amountUSD: number;
  createdBy?: string | null;
  createdAt: string;
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
