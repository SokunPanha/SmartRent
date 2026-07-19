import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';

/**
 * Database schema for the rental / property-management platform.
 *
 * Columns mirror the domain interfaces in `lib/types.ts`. Primary keys are
 * `text` because ids are application-generated strings (e.g. "prop-1",
 * "inv-june-...") shared with the existing seed data and client.
 */

export const properties = pgTable('properties', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameKh: text('name_kh').notNull(),
  type: text('type').notNull(), // 'apartment' | 'borey' | 'condo' | 'guesthouse'
  address: text('address').notNull(),
  addressKh: text('address_kh').notNull(),
  totalRooms: integer('total_rooms').notNull().default(0),
  // Per-zone utility price override (KHR). Null = use the system default from
  // `systemSettings`.
  electricityRate: doublePrecision('electricity_rate'),
  waterRate: doublePrecision('water_rate'),
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull(),
  roomNumber: text('room_number').notNull(),
  floor: integer('floor').notNull(),
  rentAmount: doublePrecision('rent_amount').notNull(), // USD
  status: text('status').notNull(), // 'vacant' | 'occupied' | 'maintenance'
});

export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameKh: text('name_kh').notNull(),
  phone: text('phone').notNull(),
  nationalId: text('national_id').notNull(),
  email: text('email'),
  checkInDate: text('check_in_date').notNull(),
  emergencyContact: text('emergency_contact').notNull(),
  telegramChatId: text('telegram_chat_id'),
  telegramAutoSend: boolean('telegram_auto_send'),
  // Updated whenever staff opens this tenant's message thread in the admin
  // panel. Unread = "tenant has a message newer than this." One shared
  // cursor (not per-staff-user) — matches this app's small-team scale.
  telegramMessagesReadAt: timestamp('telegram_messages_read_at', {
    withTimezone: true,
    mode: 'string',
  }),
});

// Two-way chat between a tenant (via the Telegram Mini App portal) and staff
// (via the admin Tenants panel). `senderUserId` is a users.id for staff
// messages, null for tenant-authored ones.
export const tenantMessages = pgTable('tenant_messages', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  senderType: text('sender_type').notNull(), // 'tenant' | 'staff'
  senderUserId: text('sender_user_id'),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

// Short-lived one-time codes used to privately link a tenant's Telegram
// account: staff generates one, the tenant redeems it via the bot's
// `/start <code>` deep link, which sets `tenants.telegramChatId`.
export const tenantConnectCodes = pgTable('tenant_connect_codes', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true, mode: 'string' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

export const contracts = pgTable('contracts', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  rentAmount: doublePrecision('rent_amount').notNull(), // USD
  depositAmount: doublePrecision('deposit_amount').notNull(), // USD
  electricityRate: doublePrecision('electricity_rate').notNull(), // KHR/kWh
  waterRate: doublePrecision('water_rate').notNull(), // KHR/m3
  status: text('status').notNull(), // 'active' | 'suspended' | 'expired'
});

export const meterReadings = pgTable('meter_readings', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull(),
  readingDate: text('reading_date').notNull(), // YYYY-MM-DD
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  prevElectricityValue: doublePrecision('prev_electricity_value').notNull(),
  currElectricityValue: doublePrecision('curr_electricity_value').notNull(),
  prevWaterValue: doublePrecision('prev_water_value').notNull(),
  currWaterValue: doublePrecision('curr_water_value').notNull(),
  recordedBy: text('recorded_by').notNull(),
});

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull(),
  contractId: text('contract_id').notNull(),
  roomId: text('room_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  issueDate: text('issue_date').notNull(),
  dueDate: text('due_date').notNull(),

  rentAmountUSD: doublePrecision('rent_amount_usd').notNull(),

  electricityPrev: doublePrecision('electricity_prev').notNull(),
  electricityCurr: doublePrecision('electricity_curr').notNull(),
  electricityRateKHR: doublePrecision('electricity_rate_khr').notNull(),
  electricityCostKHR: doublePrecision('electricity_cost_khr').notNull(),
  electricityCostUSD: doublePrecision('electricity_cost_usd').notNull(),

  waterPrev: doublePrecision('water_prev').notNull(),
  waterCurr: doublePrecision('water_curr').notNull(),
  waterRateKHR: doublePrecision('water_rate_khr').notNull(),
  waterCostKHR: doublePrecision('water_cost_khr').notNull(),
  waterCostUSD: doublePrecision('water_cost_usd').notNull(),

  totalAmountUSD: doublePrecision('total_amount_usd').notNull(),
  totalAmountKHR: doublePrecision('total_amount_khr').notNull(),
  amountPaidUSD: doublePrecision('amount_paid_usd').notNull().default(0),
  status: text('status').notNull(), // 'unpaid' | 'paid' | 'partial' | 'overdue'
  khmerExchangeRate: doublePrecision('khmer_exchange_rate').notNull(),
  paidDate: text('paid_date'),
  paymentMethod: text('payment_method'), // 'cash' | 'aba' | 'wing' | 'other'
  notes: text('notes'),

  telegramScheduledDate: text('telegram_scheduled_date'),
  telegramSentDate: text('telegram_sent_date'),
  telegramStatus: text('telegram_status'), // 'unscheduled' | 'scheduled' | 'sent' | 'failed'
  telegramError: text('telegram_error'),
});

// Dynamic, super-admin-defined roles. `isSystem` marks the protected Super
// Admin role (full access, not editable/deletable).
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  roleId: text('role_id'), // FK -> roles.id
  nameKh: text('name_kh'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

// One row per granted (role, permission). Absence = not granted.
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: text('role_id').notNull(),
    permission: text('permission').notNull(), // a PermissionKey
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permission] }),
  })
);

// Per-(user, building) assignment — the data-scoping layer on top of role
// capabilities. A user with ANY rows here is restricted to exactly those
// buildings; a user with NO rows (and every super admin) sees all buildings,
// which preserves the pre-scoping behavior for existing accounts.
export const userProperties = pgTable(
  'user_properties',
  {
    userId: text('user_id').notNull(),
    propertyId: text('property_id').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.propertyId] }),
  })
);

// Single-row, system-wide configuration (id is always 'global'). Holds the
// USD/KHR exchange rate and default utility prices used as fallbacks when a
// property has no per-zone override.
export const systemSettings = pgTable('system_settings', {
  id: text('id').primaryKey().default('global'),
  exchangeRateKhr: doublePrecision('exchange_rate_khr').notNull().default(4100),
  defaultElectricityRate: doublePrecision('default_electricity_rate').notNull().default(1000), // KHR/kWh
  defaultWaterRate: doublePrecision('default_water_rate').notNull().default(2000), // KHR/m3
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  timestamp: timestamp('timestamp', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  action: text('action').notNull(),
  actionKh: text('action_kh').notNull(),
  details: text('details').notNull(),
  detailsKh: text('details_kh').notNull(),
  username: text('username').notNull(),
  role: text('role').notNull(), // 'owner' | 'manager' | 'staff' | 'accountant'
});
