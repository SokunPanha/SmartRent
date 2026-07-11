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

