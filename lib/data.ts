import { Property, Room, Tenant, Contract, MeterReading, Invoice, ActivityLog } from './types';

// Default mock data to seed localStorage if empty
export const DEFAULT_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Borey Peng Huoth - Boeung Snor',
    nameKh: 'បុរី ប៉េងហួត - បឹងស្នោ',
    type: 'borey',
    address: 'National Road 1, Chbar Ampov, Phnom Penh',
    addressKh: 'ផ្លូវជាតិលេខ១, ច្បារអំពៅ, ភ្នំពេញ',
    totalRooms: 6
  },
  {
    id: 'prop-2',
    name: 'Sensok Cozy Apartment',
    nameKh: 'សែនសុខ ខូហ្ស៊ី អាផាតមិន',
    type: 'apartment',
    address: 'Street 1986, Sangkat Phnom Penh Thmey, Sen Sok, Phnom Penh',
    addressKh: 'ផ្លូវ ១៩៨៦, សង្កាត់ភ្នំពេញថ្មី, ខណ្ឌសែនសុខ, ភ្នំពេញ',
    totalRooms: 4
  }
];

export const DEFAULT_ROOMS: Room[] = [
  // Prop 1 Rooms
  { id: 'room-101', propertyId: 'prop-1', roomNumber: 'A-101', floor: 1, rentAmount: 250, status: 'occupied' },
  { id: 'room-102', propertyId: 'prop-1', roomNumber: 'A-102', floor: 1, rentAmount: 250, status: 'occupied' },
  { id: 'room-201', propertyId: 'prop-1', roomNumber: 'A-201', floor: 2, rentAmount: 280, status: 'occupied' },
  { id: 'room-202', propertyId: 'prop-1', roomNumber: 'A-202', floor: 2, rentAmount: 280, status: 'vacant' },
  { id: 'room-301', propertyId: 'prop-1', roomNumber: 'A-301', floor: 3, rentAmount: 300, status: 'maintenance' },
  { id: 'room-302', propertyId: 'prop-1', roomNumber: 'A-302', floor: 3, rentAmount: 320, status: 'vacant' },

  // Prop 2 Rooms
  { id: 'room-e01', propertyId: 'prop-2', roomNumber: 'E-01', floor: 1, rentAmount: 180, status: 'occupied' },
  { id: 'room-e02', propertyId: 'prop-2', roomNumber: 'E-02', floor: 1, rentAmount: 180, status: 'occupied' },
  { id: 'room-f01', propertyId: 'prop-2', roomNumber: 'F-01', floor: 2, rentAmount: 190, status: 'vacant' },
  { id: 'room-f02', propertyId: 'prop-2', roomNumber: 'F-02', floor: 2, rentAmount: 200, status: 'occupied' }
];

export const DEFAULT_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Sok Chamroeun',
    nameKh: 'សុខ ចំរើន',
    phone: '012 345 678',
    nationalId: '120485934',
    email: 'sok.chamroeun99@gmail.com',
    checkInDate: '2025-01-10',
    emergencyContact: 'Sok Neang (Wife) - 016 999 888',
    telegramChatId: '54829302',
    telegramAutoSend: true
  },
  {
    id: 'tenant-2',
    name: 'Chanthou Devi',
    nameKh: 'ចាន់ធូ ទេវី',
    phone: '093 555 123',
    nationalId: '010484920',
    email: 'devi.chanthou@outlook.com',
    checkInDate: '2025-03-01',
    emergencyContact: 'Chea Bunna (Brother) - 098 777 666',
    telegramChatId: '98438294',
    telegramAutoSend: true
  },
  {
    id: 'tenant-3',
    name: 'Kevin Miller',
    nameKh: 'ខេវីន មីល័រ',
    phone: '085 456 789',
    nationalId: 'PP994827',
    email: 'kevin.miller@gmail.com',
    checkInDate: '2025-06-01',
    emergencyContact: 'US Embassy - 023 217 000',
    telegramChatId: '10938493',
    telegramAutoSend: false
  },
  {
    id: 'tenant-4',
    name: 'Phan Sophea',
    nameKh: 'ផាន់ សុភា',
    phone: '097 765 4321',
    nationalId: '180293847',
    email: 'soph.phan@yahoo.com',
    checkInDate: '2024-11-15',
    emergencyContact: 'Phan Rith (Father) - 092 111 222'
  },
  {
    id: 'tenant-5',
    name: 'Vannak Boramy',
    nameKh: 'វណ្ណាក់ បូរមី',
    phone: '015 888 777',
    nationalId: '090382948',
    email: 'boramy.vannak88@gmail.com',
    checkInDate: '2025-04-15',
    emergencyContact: 'Vannak Sam (Uncle) - 012 444 333'
  },
  {
    id: 'tenant-6',
    name: 'Nguon Thida',
    nameKh: 'ងួន ធីដា',
    phone: '088 123 4455',
    nationalId: '010493845',
    email: 'thida.nguon@outlook.com',
    checkInDate: '2025-05-01',
    emergencyContact: 'Nguon Kosal (Father) - 097 555 4444'
  }
];

export const DEFAULT_CONTRACTS: Contract[] = [
  {
    id: 'cn-1',
    roomId: 'room-101',
    tenantId: 'tenant-1',
    startDate: '2025-01-10',
    endDate: '2026-01-10', // Renewed/Active - Let's push end date to late 2026 for dashboard active contracts expiring soon
    status: 'active',
    rentAmount: 250,
    depositAmount: 500,
    electricityRate: 1000, // 1000 KHR per kWh
    waterRate: 2000 // 2000 KHR per m3
  },
  {
    id: 'cn-2',
    roomId: 'room-102',
    tenantId: 'tenant-2',
    startDate: '2025-03-01',
    endDate: '2026-07-15', // Expiring extremely soon! (Mid July 2026)
    status: 'active',
    rentAmount: 250,
    depositAmount: 250,
    electricityRate: 1000,
    waterRate: 2000
  },
  {
    id: 'cn-3',
    roomId: 'room-201',
    tenantId: 'tenant-3',
    startDate: '2025-06-01',
    endDate: '2026-06-30', // Expiring in two weeks! (June 30, 2026)
    status: 'active',
    rentAmount: 280,
    depositAmount: 560,
    electricityRate: 1200, // Premium property / foreigner rate
    waterRate: 2500
  },
  {
    id: 'cn-4',
    roomId: 'room-e01',
    tenantId: 'tenant-4',
    startDate: '2024-11-15',
    endDate: '2025-11-15', // Actually Expired, but they are on rolling or we keep it listed
    status: 'expired',
    rentAmount: 180,
    depositAmount: 180,
    electricityRate: 1000,
    waterRate: 1500
  },
  {
    id: 'cn-5',
    roomId: 'room-e02',
    tenantId: 'tenant-5',
    startDate: '2025-04-15',
    endDate: '2026-04-15', // Expired contract
    status: 'expired',
    rentAmount: 180,
    depositAmount: 180,
    electricityRate: 1000,
    waterRate: 1500
  },
  {
    id: 'cn-6',
    roomId: 'room-f02',
    tenantId: 'tenant-6',
    startDate: '2025-05-01',
    endDate: '2026-10-01', // Expiring October 2026
    status: 'active',
    rentAmount: 200,
    depositAmount: 400,
    electricityRate: 1000,
    waterRate: 1500
  }
];

export const DEFAULT_METER_READINGS: MeterReading[] = [
  // Readings for Room 101
  { id: 'mr-101-4', roomId: 'room-101', readingDate: '2026-04-30', year: 2026, month: 4, prevElectricityValue: 4120, currElectricityValue: 4210, prevWaterValue: 310, currWaterValue: 322, recordedBy: 'Seng Hour' },
  { id: 'mr-101-5', roomId: 'room-101', readingDate: '2026-05-31', year: 2026, month: 5, prevElectricityValue: 4210, currElectricityValue: 4315, prevWaterValue: 322, currWaterValue: 335, recordedBy: 'Seng Hour' },
  { id: 'mr-101-6', roomId: 'room-101', readingDate: '2026-06-12', year: 2026, month: 6, prevElectricityValue: 4315, currElectricityValue: 4425, prevWaterValue: 335, currWaterValue: 349, recordedBy: 'Seng Hour' },

  // Readings for Room 102
  { id: 'mr-102-4', roomId: 'room-102', readingDate: '2026-04-30', year: 2026, month: 4, prevElectricityValue: 1205, currElectricityValue: 1290, prevWaterValue: 104, currWaterValue: 115, recordedBy: 'Seng Hour' },
  { id: 'mr-102-5', roomId: 'room-102', readingDate: '2026-05-31', year: 2026, month: 5, prevElectricityValue: 1290, currElectricityValue: 1385, prevWaterValue: 115, currWaterValue: 128, recordedBy: 'Seng Hour' },
  { id: 'mr-102-6', roomId: 'room-102', readingDate: '2026-06-12', year: 2026, month: 6, prevElectricityValue: 1385, currElectricityValue: 1475, prevWaterValue: 128, currWaterValue: 141, recordedBy: 'Seng Hour' },

  // Readings for Room 201
  { id: 'mr-201-4', roomId: 'room-201', readingDate: '2026-04-30', year: 2026, month: 4, prevElectricityValue: 2840, currElectricityValue: 2955, prevWaterValue: 420, currWaterValue: 435, recordedBy: 'Seng Hour' },
  { id: 'mr-201-5', roomId: 'room-201', readingDate: '2026-05-31', year: 2026, month: 5, prevElectricityValue: 2955, currElectricityValue: 3080, prevWaterValue: 435, currWaterValue: 452, recordedBy: 'Seng Hour' },
  { id: 'mr-201-6', roomId: 'room-201', readingDate: '2026-06-12', year: 2026, month: 6, prevElectricityValue: 3080, currElectricityValue: 3195, prevWaterValue: 452, currWaterValue: 468, recordedBy: 'Seng Hour' },

  // Readings for Room E01
  { id: 'mr-e01-4', roomId: 'room-e01', readingDate: '2026-04-30', year: 2026, month: 4, prevElectricityValue: 980, currElectricityValue: 1045, prevWaterValue: 88, currWaterValue: 96, recordedBy: 'Keo Sophat' },
  { id: 'mr-e01-5', roomId: 'room-e01', readingDate: '2026-05-31', year: 2026, month: 5, prevElectricityValue: 1045, currElectricityValue: 1110, prevWaterValue: 96, currWaterValue: 103, recordedBy: 'Keo Sophat' },

  // Readings for Room E02
  { id: 'mr-e02-4', roomId: 'room-e02', readingDate: '2026-04-30', year: 2026, month: 4, prevElectricityValue: 1540, currElectricityValue: 1618, prevWaterValue: 185, currWaterValue: 196, recordedBy: 'Keo Sophat' },
  { id: 'mr-e02-5', roomId: 'room-e02', readingDate: '2026-05-31', year: 2026, month: 5, prevElectricityValue: 1618, currElectricityValue: 1690, prevWaterValue: 196, currWaterValue: 207, recordedBy: 'Keo Sophat' },

  // Readings for Room F02
  { id: 'mr-f02-4', roomId: 'room-f02', readingDate: '2026-04-30', year: 2026, month: 4, prevElectricityValue: 740, currElectricityValue: 805, prevWaterValue: 54, currWaterValue: 62, recordedBy: 'Keo Sophat' },
  { id: 'mr-f02-5', roomId: 'room-f02', readingDate: '2026-05-31', year: 2026, month: 5, prevElectricityValue: 805, currElectricityValue: 880, prevWaterValue: 62, currWaterValue: 71, recordedBy: 'Keo Sophat' },
  { id: 'mr-f02-6', roomId: 'room-f02', readingDate: '2026-06-12', year: 2026, month: 6, prevElectricityValue: 880, currElectricityValue: 945, prevWaterValue: 71, currWaterValue: 80, recordedBy: 'Keo Sophat' }
];

export const DEFAULT_INVOICES: Invoice[] = [
  // --- APRIL 2026 INVOICES (ALL PAID) ---
  {
    id: 'inv-101-4',
    invoiceNumber: 'INV-2026-04101',
    contractId: 'cn-1',
    roomId: 'room-101',
    tenantId: 'tenant-1',
    year: 2026,
    month: 4,
    issueDate: '2026-04-30',
    dueDate: '2026-05-05',
    rentAmountUSD: 250,
    electricityPrev: 4120,
    electricityCurr: 4210,
    electricityRateKHR: 1000,
    electricityCostKHR: 90000, // (4210-4120 = 90 kWh) * 1000 = 90,000 KHR
    electricityCostUSD: 21.95, // 90000 / 4100
    waterPrev: 310,
    waterCurr: 322,
    waterRateKHR: 2000,
    waterCostKHR: 24000, // (322-310 = 12 m3) * 2000 = 24,000 KHR
    waterCostUSD: 5.85, // 24000 / 4100
    totalAmountUSD: 277.80, // 250 + 21.95 + 5.85
    totalAmountKHR: 1139000, // 277.8 * 4100 = 1,138,980 ~ 1,139,000 KHR
    amountPaidUSD: 277.80,
    status: 'paid',
    khmerExchangeRate: 4100,
    paidDate: '2026-05-03',
    paymentMethod: 'aba',
    notes: 'Paid on-time via ABA QR Code'
  },
  {
    id: 'inv-102-4',
    invoiceNumber: 'INV-2026-04102',
    contractId: 'cn-2',
    roomId: 'room-102',
    tenantId: 'tenant-2',
    year: 2026,
    month: 4,
    issueDate: '2026-04-30',
    dueDate: '2026-05-05',
    rentAmountUSD: 250,
    electricityPrev: 1205,
    electricityCurr: 1290,
    electricityRateKHR: 1000,
    electricityCostKHR: 85000, // 85 * 1000
    electricityCostUSD: 20.73,
    waterPrev: 104,
    waterCurr: 115,
    waterRateKHR: 2000,
    waterCostKHR: 22000, // 11 * 2000
    waterCostUSD: 5.37,
    totalAmountUSD: 276.10,
    totalAmountKHR: 1132010,
    amountPaidUSD: 276.10,
    status: 'paid',
    khmerExchangeRate: 4100,
    paidDate: '2026-05-04',
    paymentMethod: 'cash',
    notes: 'Paid in cash to Seng Hour'
  },
  {
    id: 'inv-201-4',
    invoiceNumber: 'INV-2026-04201',
    contractId: 'cn-3',
    roomId: 'room-201',
    tenantId: 'tenant-3',
    year: 2026,
    month: 4,
    issueDate: '2026-04-30',
    dueDate: '2026-05-05',
    rentAmountUSD: 280,
    electricityPrev: 2840,
    electricityCurr: 2955,
    electricityRateKHR: 1200,
    electricityCostKHR: 138000, // 115 * 1200
    electricityCostUSD: 33.66,
    waterPrev: 420,
    waterCurr: 435,
    waterRateKHR: 2500,
    waterCostKHR: 37500, // 15 * 2500
    waterCostUSD: 9.15,
    totalAmountUSD: 322.81,
    totalAmountKHR: 1323521,
    amountPaidUSD: 322.81,
    status: 'paid',
    khmerExchangeRate: 4100,
    paidDate: '2026-05-02',
    paymentMethod: 'aba',
    notes: 'ABA instant transfer'
  },

  // --- MAY 2026 INVOICES (PARTIAL & OVERDUE COEXIST) ---
  {
    id: 'inv-101-5',
    invoiceNumber: 'INV-2026-05101',
    contractId: 'cn-1',
    roomId: 'room-101',
    tenantId: 'tenant-1',
    year: 2026,
    month: 5,
    issueDate: '2026-05-31',
    dueDate: '2026-06-05', // Past due, so overdue if unpaid! Actually, let's mark it PAID.
    rentAmountUSD: 250,
    electricityPrev: 4210,
    electricityCurr: 4315,
    electricityRateKHR: 1000,
    electricityCostKHR: 105000, // 105 * 1000
    electricityCostUSD: 25.61,
    waterPrev: 322,
    waterCurr: 335,
    waterRateKHR: 2000,
    waterCostKHR: 26000, // 13 * 2000
    waterCostUSD: 6.34,
    totalAmountUSD: 281.95,
    totalAmountKHR: 1156000,
    amountPaidUSD: 281.95,
    status: 'paid',
    khmerExchangeRate: 4100,
    paidDate: '2026-06-04',
    paymentMethod: 'aba'
  },
  {
    id: 'inv-102-5',
    invoiceNumber: 'INV-2026-05102',
    contractId: 'cn-2',
    roomId: 'room-102',
    tenantId: 'tenant-2',
    year: 2026,
    month: 5,
    issueDate: '2026-05-31',
    dueDate: '2026-06-05', // Real Overdue Invoice!
    rentAmountUSD: 250,
    electricityPrev: 1290,
    electricityCurr: 1385,
    electricityRateKHR: 1000,
    electricityCostKHR: 95000,
    electricityCostUSD: 23.17,
    waterPrev: 115,
    waterCurr: 128,
    waterRateKHR: 2000,
    waterCostKHR: 26000,
    waterCostUSD: 6.34,
    totalAmountUSD: 279.51,
    totalAmountKHR: 1146000,
    amountPaidUSD: 0,
    status: 'overdue',
    khmerExchangeRate: 4100,
    notes: 'Tenant said she was out of town, will pay mid-June. Still unpaid.'
  },
  {
    id: 'inv-201-5',
    invoiceNumber: 'INV-2026-05201',
    contractId: 'cn-3',
    roomId: 'room-201',
    tenantId: 'tenant-3',
    year: 2026,
    month: 5,
    issueDate: '2026-05-31',
    dueDate: '2026-06-05', // Partially paid invoice!
    rentAmountUSD: 280,
    electricityPrev: 2955,
    electricityCurr: 3080,
    electricityRateKHR: 1200,
    electricityCostKHR: 150000,
    electricityCostUSD: 36.59,
    waterPrev: 435,
    waterCurr: 452,
    waterRateKHR: 2500,
    waterCostKHR: 42500,
    waterCostUSD: 10.37,
    totalAmountUSD: 326.96,
    totalAmountKHR: 1340500,
    amountPaidUSD: 200, // Paid 200 USD, owes 126.96 USD
    status: 'partial',
    khmerExchangeRate: 4100,
    paidDate: '2026-06-05',
    paymentMethod: 'aba',
    notes: 'Paid $200. Promised to pay the rest ($126.96) next week.'
  },

  // --- JUNE 2026 INVOICES (DRAFT / UNPAID - JUST SENT) ---
  {
    id: 'inv-101-6',
    invoiceNumber: 'INV-2026-06101',
    contractId: 'cn-1',
    roomId: 'room-101',
    tenantId: 'tenant-1',
    year: 2026,
    month: 6,
    issueDate: '2026-06-12',
    dueDate: '2026-06-20',
    rentAmountUSD: 250,
    electricityPrev: 4315,
    electricityCurr: 4425,
    electricityRateKHR: 1000,
    electricityCostKHR: 110000, // 110 * 1000
    electricityCostUSD: 26.83,
    waterPrev: 335,
    waterCurr: 349,
    waterRateKHR: 2000,
    waterCostKHR: 28000, // 14 * 2000
    waterCostUSD: 6.83,
    totalAmountUSD: 283.66,
    totalAmountKHR: 1163000,
    amountPaidUSD: 0,
    status: 'unpaid',
    khmerExchangeRate: 4100,
    notes: 'June invoice newly generated.'
  },
  {
    id: 'inv-102-6',
    invoiceNumber: 'INV-2026-06102',
    contractId: 'cn-2',
    roomId: 'room-102',
    tenantId: 'tenant-2',
    year: 2026,
    month: 6,
    issueDate: '2026-06-12',
    dueDate: '2026-06-20',
    rentAmountUSD: 250,
    electricityPrev: 1385,
    electricityCurr: 1475,
    electricityRateKHR: 1000,
    electricityCostKHR: 90000, // 90 * 1000
    electricityCostUSD: 21.95,
    waterPrev: 128,
    waterCurr: 141,
    waterRateKHR: 2000,
    waterCostKHR: 26000, // 13 * 2000
    waterCostUSD: 6.34,
    totalAmountUSD: 278.29,
    totalAmountKHR: 1141000,
    amountPaidUSD: 0,
    status: 'unpaid',
    khmerExchangeRate: 4100
  },
  {
    id: 'inv-201-6',
    invoiceNumber: 'INV-2026-06201',
    contractId: 'cn-3',
    roomId: 'room-201',
    tenantId: 'tenant-3',
    year: 2026,
    month: 6,
    issueDate: '2026-06-12',
    dueDate: '2026-06-20',
    rentAmountUSD: 280,
    electricityPrev: 3080,
    electricityCurr: 3195,
    electricityRateKHR: 1200,
    electricityCostKHR: 138000, // 115 * 1200
    electricityCostUSD: 33.66,
    waterPrev: 452,
    waterCurr: 468,
    waterRateKHR: 2500,
    waterCostKHR: 40000, // 16 * 2500
    waterCostUSD: 9.76,
    totalAmountUSD: 323.42,
    totalAmountKHR: 1326000,
    amountPaidUSD: 0,
    status: 'unpaid',
    khmerExchangeRate: 4100
  }
];

export const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-15T14:30:00Z',
    action: 'Recorded Meter Readings',
    actionKh: 'កត់ត្រាកុងទ័រទឹកភ្លើង',
    details: 'Recorded June readings for A-101, A-102 and A-201',
    detailsKh: 'បានកត់ត្រាតម្លៃកុងទ័រខែមិថុនា សម្រាប់បន្ទប់ A-101, A-102 នឹង A-201',
    username: 'Seng Hour',
    role: 'staff'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-14T11:15:00Z',
    action: 'Generated Invoices',
    actionKh: 'បង្កើតវិក្កយបត្រ',
    details: 'Generated 3 draft invoices for June 2026 sequence',
    detailsKh: 'បានបង្កើតវិក្កយបត្រព្រាងចំនួន ៣ សម្រាប់ខែមិថុនា ឆ្នាំ ២០២៦',
    username: 'Keo Sophat',
    role: 'manager'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-05T09:45:00Z',
    action: 'Recorded Partial Payment',
    actionKh: 'កត់ត្រាការបង់ប្រាក់មួយផ្នែក',
    details: 'Recorded partial payment of $200 of Invoice #INV-2026-05201',
    detailsKh: 'បានកត់ត្រាការបង់ប្រាក់សាកល្បង $200 លើវិក្កយបត្រ #INV-2026-05201',
    username: 'Lim Bunheng',
    role: 'accountant'
  },
  {
    id: 'log-4',
    timestamp: '2026-06-04T16:20:00Z',
    action: 'Recorded Rent Payment',
    actionKh: 'កត់ត្រាការបង់ប្រាក់ពេញលេញ',
    details: 'Recorded full payment of $281.95 for Room A-101 via ABA QR',
    detailsKh: 'បានកត់ត្រាការទូទាត់ពេញលេញ $281.95 នៃបន្ទប់ A-101 តាម ABA QR',
    username: 'Lim Bunheng',
    role: 'accountant'
  },
  {
    id: 'log-5',
    timestamp: '2026-05-15T10:00:00Z',
    action: 'Created Rental Contract',
    actionKh: 'បង្កើតកិច្ចសន្យាថ្មី',
    details: 'Created active contract for Room F-02 with Tenant Nguon Thida',
    detailsKh: 'បានបង្កើតកិច្ចសន្យាឱ្យជួលបន្ទប់ F-02 ជាមួយអ្នកជួលឈ្មោះ ងួន ធីដា',
    username: 'Keo Sophat',
    role: 'manager'
  }
];

// Dictionary translations map
export const TRANSLATIONS = {
  en: {
    // Nav / Layout
    title: "Cambodia Property & Invoice Manager",
    owner_suite: "Landlord Portal",
    khemar_lang: "ភាសាខ្មែរ",
    english_lang: "English",
    active_role: "Active Persona",
    role_owner: "Owner (All)",
    role_manager: "Manager (Properties & Bills)",
    role_staff: "Staff (Readings & Bills)",
    role_accountant: "Accountant (Payments & Reports)",

    // Tabs
    tab_dashboard: "Dashboard",
    tab_properties: "Properties & Rooms",
    tab_tenants: "Tenants & Contracts",
    tab_utilities: "Meter Readings",
    tab_invoices: "Invoices & Payments",
    tab_reports: "Financial Reports",

    // Dashboard Cards
    total_properties: "Total Properties",
    total_rooms: "Total Rooms",
    occupied_rooms: "Occupied Rooms",
    vacant_rooms: "Vacant Rooms",
    monthly_revenue: "June Rent Revenue",
    outstanding_amount: "Unpaid Balance",
    overdue_invoices: "Overdue Invoices",
    contracts_expiring: "Contracts Expiring",

    // Detail dashboard
    dashboard_summary: "Property Dashboard",
    revenue_trend: "Monthly Revenue Trend (USD)",
    occupancy_rate: "Occupancy Breakdowns",
    payment_collection_rate: "Invoice Payment Rate",
    utility_consumption: "Utility Consumer Outlay",
    recent_activities: "Recent Activity Log",
    no_activity: "No activity recorded.",

    // Properties Tab
    add_property: "Add Property",
    add_room: "Add Room",
    property_list: "Property Locations",
    room_count: "rooms",
    property_type: "Type",
    address: "Location Address",
    rooms_for: "Rooms inside",
    floor: "Floor",
    rent_rate: "Base Rent",
    status: "Status",
    vacant: "Vacant",
    occupied: "Occupied",
    maintenance: "Under Maintenance",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",

    // Tenants & Contracts
    tenant_list: "Rent Tenants",
    add_tenant: "Add Tenant",
    contracts_list: "Active Contracts",
    add_contract: "Create Contract",
    phone: "Phone",
    national_id: "NID / Passport",
    check_in: "Check-in",
    emergency_contact: "Emergency Backup",
    tenant_name: "Tenant Name",
    room: "Room No",
    start_date: "Starts",
    end_date: "Expires",
    duration: "Contract Duration",
    monthly_rent: "Monthly Rent",
    deposit: "Security Deposit",
    el_rate: "Electric Rate",
    wt_rate: "Water Rate",
    active: "Active",
    suspended: "Suspended",
    expired: "Expired",

    // Utilities / Meter Readings
    meter_readings: "Meter Records",
    record_reading: "Record New Readings",
    room_number: "Room Number",
    reading_date: "Recorded Date",
    electric_prev: "Prev Electric (kWh)",
    electric_curr: "Curr Electric (kWh)",
    water_prev: "Prev Water (m³)",
    water_curr: "Curr Water (m³)",
    units_used: "Units Used",
    recorded_by: "Read By",

    // Invoices & Payments
    invoice_list: "Invoice Ledger",
    generate_monthly_invoices: "Auto-Generate June Invoices",
    invoice_no: "Invoice #",
    due_date: "Due Date",
    total_amount: "Amount USD",
    amount_khr: "Amount KHR",
    amount_paid: "Paid USD",
    payment_status: "Status",
    record_payment: "Log Payment",
    print_invoice: "Print / PDF",
    paid: "Paid",
    unpaid: "Unpaid",
    partial: "Partially Paid",
    overdue: "Overdue",
    exchange_rate: "Exchange Rate KHR",
    print_title: "RENTAL INVOICE / វិក្កយបត្រថ្លៃឈ្នួល",
    landlord_sig: "Landlord Signature",
    tenant_sig: "Tenant Signature",
    bank_qr_placeholder: "ABA Pay QR Code",
    utility_bill_breakdown: "Utility Consumption Breakdown",

    // Forms
    save: "Save / Submit",
    cancel: "Cancel",
    confirm_delete: "Are you sure you want to delete this?",
    please_fill: "Please complete all mandatory parameters.",
    success: "Operation successful!",
    insufficient_permissions: "Action Blocked: Your active persona role lacks access permits."
  },
  kh: {
    // Nav / Layout
    title: "ប្រព័ន្ធគ្រប់គ្រងការជួល និងវិក្កយបត្រ (កម្ពុជា)",
    owner_suite: "គណនីម្ចាស់ផ្ទះ",
    khemar_lang: "ភាសាខ្មែរ",
    english_lang: "English",
    active_role: "តួនាទីបច្ចុប្បន្ន",
    role_owner: "ម្ចាស់អចលនទ្រព្យ (ទាំងអស់)",
    role_manager: "អ្នកចាត់ការ (គ្រប់គ្រងបន្ទប់/វិក្កយបត្រ)",
    role_staff: "បុគ្គលិក (កត់កុងទ័រ/វិក្កយបត្រ)",
    role_accountant: "គណនេយ្យករ (ការបង់ប្រាក់/របាយការណ៍)",

    // Tabs
    tab_dashboard: "ផ្ទាំងព័ត៌មាន",
    tab_properties: "ទីតាំង និងបន្ទប់",
    tab_tenants: "អ្នកជួល និងកិច្ចសន្យា",
    tab_utilities: "ការកត់ត្រាកុងទ័រ",
    tab_invoices: "វិក្កយបត្រ និងការបង់ប្រាក់",
    tab_reports: "របាយការណ៍ហិរញ្ញវត្ថុ",

    // Dashboard Cards
    total_properties: "ទីតាំងសរុប",
    total_rooms: "បន្ទប់សរុប",
    occupied_rooms: "បន្ទប់មានអ្នកជួល",
    vacant_rooms: "បន្ទប់នៅទំនេរ",
    monthly_revenue: "ចំណូលប្រចាំខែមិថុនា",
    outstanding_amount: "ប្រាក់មិនទាន់បង់សរុប",
    overdue_invoices: "វិក្កយបត្រហួសកំណត់",
    contracts_expiring: "កិច្ចសន្យាជិតផុតកំណត់",

    // Detail dashboard
    dashboard_summary: "តារាងសង្ខេបអចលនទ្រព្យ",
    revenue_trend: "និន្នាការចំណូលប្រចាំខែ (USD)",
    occupancy_rate: "អត្រាកាន់កាប់បន្ទប់",
    payment_collection_rate: "អត្រាប្រមូលប្រាក់វិក្កយបត្រ",
    utility_consumption: "ការចំណាយលើទឹកភ្លើង",
    recent_activities: "កំណត់ហេតុសកម្មភាពថ្មីៗ",
    no_activity: "មិនទាន់មានសកម្មភាពទើបកត់ត្រាឡើយ។",

    // Properties Tab
    add_property: "បន្ថែមទីតាំង",
    add_room: "បន្ថែមបន្ទប់",
    property_list: "បញ្ជីឈ្មោះទីតាំងជួល",
    room_count: "បន្ទប់",
    property_type: "ប្រភេទ",
    address: "អាសយដ្ឋានទីតាំង",
    rooms_for: "បន្ទប់ក្នុង",
    floor: "ជាន់ទី",
    rent_rate: "តម្លៃជួលមូលដ្ឋាន",
    status: "ស្ថានភាព",
    vacant: "នៅទំនេរ",
    occupied: "មានអ្នកជួល",
    maintenance: "កំពុងជួសជុល",
    actions: "សកម្មភាព",
    edit: "កែប្រែ",
    delete: "លុប",

    // Tenants & Contracts
    tenant_list: "បញ្ជីឈ្មោះអ្នកជួល",
    add_tenant: "បន្ថែមអ្នកជួល",
    contracts_list: "កិច្ចសន្យាជួលសកម្ម",
    add_contract: "បង្កើតកិច្ចសន្យា",
    phone: "លេខទូរស័ព្ទ",
    national_id: "អត្តសញ្ញាណប័ណ្ណ / លិខិតឆ្លងដែន",
    check_in: "ថ្ងៃចូលរស់នៅ",
    emergency_contact: "ទំនាក់ទំនងអាសន្ន",
    tenant_name: "ឈ្មោះអ្នកជួល",
    room: "បន្ទប់លេខ",
    start_date: "ថ្ងៃចាប់ផ្តើម",
    end_date: "ថ្ងៃផុតកំណត់",
    duration: "រយៈពេលកិច្ចសន្យា",
    monthly_rent: "ថ្លៃជួលប្រចាំខែ",
    deposit: "ប្រាក់កក់ធានា",
    el_rate: "ថ្លៃអគ្គិសនី (KHR)",
    wt_rate: "ថ្លៃទឹកស្អាត (KHR)",
    active: "ដើរតួសកម្ម",
    suspended: "ផ្អាកដំណើរការ",
    expired: "ហួសកាលកំណត់",

    // Utilities / Meter Readings
    meter_readings: "ការកត់កុងទ័រ",
    record_reading: "កត់ត្រាកុងទ័រថ្មី",
    room_number: "បន្ទប់លេខ",
    reading_date: "កាលបរិច្ឆេទកត់ត្រា",
    electric_prev: "លេខអគ្គិសនីចាស់ (kWh)",
    electric_curr: "លេខអគ្គិសនីថ្មី (kWh)",
    water_prev: "លេខទឹកចាស់ (m³)",
    water_curr: "លេខទឹកថ្មី (m³)",
    units_used: "ចំនួនប្រើប្រាស់",
    recorded_by: "កត់ត្រាដោយ",

    // Invoices & Payments
    invoice_list: "បញ្ជីវិក្កយបត្រជួល",
    generate_monthly_invoices: "បង្កើតវិក្កយបត្រថ្មីខែមិថុនា",
    invoice_no: "លេខវិក្កយបត្រ",
    due_date: "ថ្ងៃត្រូវបង់ប្រាក់",
    total_amount: "សរុបជាដុល្លារ",
    amount_khr: "សរុបជារៀល",
    amount_paid: "បានបង់ (USD)",
    payment_status: "ស្ថានភាព",
    record_payment: "រៀបចំការបង់ប្រាក់",
    print_invoice: "បោះពុម្ពវិក្កយបត្រ",
    paid: "បានបង់ប្រាក់",
    unpaid: "មិនទាន់បង់",
    partial: "បង់បានខ្លះ",
    overdue: "ហួសកាលកំណត់",
    exchange_rate: "អត្រាប្តូរប្រាក់រៀល",
    print_title: "វិក្កយបត្រថ្លៃឈ្នួល / RENTAL INVOICE",
    landlord_sig: "ហត្ថលេខាម្ចាស់ផ្ទះ",
    tenant_sig: "ហត្ថលេខាអ្នកជួល",
    bank_qr_placeholder: "ទូទាត់រហ័សតាម ABA Pay QR",
    utility_bill_breakdown: "លម្អិតអំពីការប្រើប្រាស់ទឹកភ្លើង",

    // Forms
    save: "រក្សាទុកទិន្នន័យ",
    cancel: "បដិសេធ",
    confirm_delete: "តើអ្នកប្រាកដជាចង់លុបទិន្នន័យនេះមែនទេ?",
    please_fill: "សូមបំពេញព័ត៌មានចាំបាច់ឱ្យបានគ្រប់ជ្រុងជ្រោយ។",
    success: "ប្រតិបត្តិការទទួលបានជោគជ័យ!",
    insufficient_permissions: "ប្រតិបត្តិការត្រូវបានរារាំង៖ តួនាទីរបស់អ្នកមិនមានសិទ្ធិចូលប្រើប្រាស់ឡើយ។"
  }
};
