import bcrypt from 'bcryptjs';
import { db } from './index';
import {
  properties,
  rooms,
  tenants,
  tenantMessages,
  tenantConnectCodes,
  contracts,
  meterReadings,
  invoices,
  roles,
  users,
  rolePermissions,
  userProperties,
  fees,
  propertyFees,
  invoiceFees,
  systemSettings,
  activityLogs,
} from './schema';
import { PERMISSION_KEYS, SUPER_ADMIN_ROLE_NAME } from '../permissions';

/**
 * Bulk demo seed — generates 50+ rows for every table with valid foreign-key
 * relationships. Wipes existing data first (idempotent). `system_settings` is
 * a documented singleton (one 'global' row).
 *
 *   node --import tsx --env-file=.env.local lib/db/seed-bulk.ts
 */

const EXCHANGE = 4100;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const chunk = <T>(arr: T[], n: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};
async function insertAll<T>(table: any, rows: T[], size = 200) {
  for (const c of chunk(rows, size)) if (c.length) await db.insert(table).values(c);
}

const KH_FIRST = ['សុខ', 'ដារ៉ា', 'សុភា', 'ចាន់', 'រតនា', 'បូរ៉ា', 'វិសាល', 'ពិសិដ្ឋ', 'ចន្ទី', 'កុសល', 'នារី', 'វណ្ណា', 'សុគន្ធា', 'ស្រីនាថ', 'មករា', 'ពិសី', 'សំណាង', 'ធារ៉ា', 'លីដា', 'សុវណ្ណ'];
const EN_FIRST = ['Sok', 'Dara', 'Sophea', 'Chan', 'Ratana', 'Bora', 'Visal', 'Piseth', 'Chanty', 'Kosal', 'Neary', 'Vanna', 'Sokunthea', 'Sreyneath', 'Makara', 'Pisey', 'Samnang', 'Theara', 'Lida', 'Sovann'];
const EN_LAST = ['Chhun', 'Meas', 'Kim', 'Ly', 'Sok', 'Chea', 'Ouk', 'Heng', 'Pich', 'Nov', 'Sam', 'Yan', 'Ros', 'Tep', 'Vong'];
const KH_LAST = ['ឈុន', 'មាស', 'គីម', 'លី', 'សុខ', 'ជា', 'អ៊ុក', 'ហេង', 'ពេជ្រ', 'នៅ', 'សំ', 'យ៉ន', 'រស់', 'ទេព', 'វង្ស'];
const PROP_TYPES = ['apartment', 'borey', 'condo', 'guesthouse'];
const DISTRICTS = ['Toul Kork', 'Sen Sok', 'Chamkarmon', 'Daun Penh', 'Chbar Ampov', 'Mean Chey', 'Russey Keo', 'Boeung Keng Kang', 'Chroy Changvar', 'Dangkao'];
const DISTRICTS_KH = ['ទួលគោក', 'សែនសុខ', 'ចំការមន', 'ដូនពេញ', 'ច្បារអំពៅ', 'មានជ័យ', 'ឫស្សីកែវ', 'បឹងកេងកង', 'ជ្រោយចង្វារ', 'ដង្កោ'];
const phone = () => `0${pick(['1', '6', '7', '8', '9'])}${pick(['1', '2', '6', '7', '8'])} ${randInt(100, 999)} ${randInt(100, 999)}`;
const fullEn = () => `${pick(EN_FIRST)} ${pick(EN_LAST)}`;

async function seed() {
  console.log('Bulk seeding…');

  // Wipe (child → parent).
  for (const t of [invoiceFees, invoices, meterReadings, contracts, tenantMessages, tenantConnectCodes, rooms, tenants, propertyFees, fees, userProperties, rolePermissions, users, roles, properties, activityLogs, systemSettings]) {
    await db.delete(t);
  }

  // --- system_settings (singleton) ---
  await db.insert(systemSettings).values({ id: 'global', exchangeRateKhr: EXCHANGE, defaultElectricityRate: 1000, defaultWaterRate: 2000 });

  // --- roles (Super Admin + 51 custom) ---
  const roleRows = [{ id: 'role-super-admin', name: SUPER_ADMIN_ROLE_NAME, description: 'Full system access', isSystem: true }];
  const roleBase = ['Manager', 'Cashier', 'Accountant', 'Receptionist', 'Maintenance', 'Security', 'Supervisor', 'Clerk', 'Agent', 'Collector'];
  for (let i = 1; i <= 51; i++) roleRows.push({ id: `role-${i}`, name: `${pick(roleBase)} ${i}`, description: `Staff role #${i}`, isSystem: false });
  await insertAll(roles, roleRows);

  // --- role_permissions (random subset per custom role) ---
  const rpRows: { roleId: string; permission: string }[] = [];
  for (const p of PERMISSION_KEYS) rpRows.push({ roleId: 'role-super-admin', permission: p });
  for (let i = 1; i <= 51; i++) {
    const shuffled = [...PERMISSION_KEYS].sort(() => Math.random() - 0.5).slice(0, randInt(1, 5));
    for (const p of shuffled) rpRows.push({ roleId: `role-${i}`, permission: p });
  }
  await insertAll(rolePermissions, rpRows);

  // --- users (admin + 59 staff) ---
  const pwHash = await bcrypt.hash('password123', 10);
  const userRows = [{ id: 'user-admin', name: 'System Administrator', nameKh: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ', email: 'admin@khrent.local', passwordHash: pwHash, roleId: 'role-super-admin', phone: phone(), position: 'Owner', active: true, preferredLang: null as string | null }];
  for (let i = 1; i <= 59; i++) {
    userRows.push({ id: `user-${i}`, name: fullEn(), nameKh: `${pick(KH_FIRST)} ${pick(KH_LAST)}`, email: `staff${i}@khrent.local`, passwordHash: pwHash, roleId: `role-${randInt(1, 51)}`, phone: phone(), position: pick(['Building Manager', 'Cashier', 'Accountant', 'Receptionist', 'Maintenance']), active: Math.random() > 0.15, preferredLang: pick([null, 'en', 'km']) });
  }
  await insertAll(users, userRows);

  // --- properties (50) ---
  const propRows: any[] = [];
  for (let i = 1; i <= 50; i++) {
    const d = randInt(0, DISTRICTS.length - 1);
    propRows.push({ id: `prop-${i}`, name: `${pick(['Sunrise', 'Riverside', 'Golden', 'Diamond', 'Royal', 'Green', 'City', 'Star'])} ${pick(['Residence', 'Apartment', 'Court', 'Villa', 'Tower'])} ${i}`, nameKh: `អគារលេខ ${i}`, type: pick(PROP_TYPES), address: `#${randInt(1, 300)}, St. ${randInt(100, 600)}, ${DISTRICTS[d]}, Phnom Penh`, addressKh: `ផ្ទះលេខ ${randInt(1, 300)}, ផ្លូវ ${randInt(100, 600)}, ${DISTRICTS_KH[d]}, ភ្នំពេញ`, totalRooms: 0, electricityRate: Math.random() > 0.6 ? pick([1100, 1200, 900]) : null, waterRate: Math.random() > 0.7 ? pick([2200, 2500]) : null });
  }
  await insertAll(properties, propRows);

  // --- rooms (6 per property = 300) ---
  const roomRows: any[] = [];
  const roomsByProp: Record<string, string[]> = {};
  for (const p of propRows) {
    roomsByProp[p.id] = [];
    for (let f = 1; f <= 3; f++) {
      for (let n = 1; n <= 2; n++) {
        const id = `room-${p.id.split('-')[1]}-${f}${n}`;
        roomRows.push({ id, propertyId: p.id, roomNumber: `${String.fromCharCode(64 + f)}-${f}0${n}`, floor: f, rentAmount: pick([120, 150, 180, 200, 250, 300, 350]), status: 'vacant' });
        roomsByProp[p.id].push(id);
      }
    }
    p.totalRooms = 6;
  }

  // --- tenants (250) ---
  const tenantRows: any[] = [];
  for (let i = 1; i <= 250; i++) {
    tenantRows.push({ id: `tenant-${i}`, name: fullEn(), nameKh: `${pick(KH_FIRST)} ${pick(KH_LAST)}`, phone: phone(), nationalId: `${randInt(1, 3)}${randInt(100000000, 999999999)}`, email: Math.random() > 0.5 ? `tenant${i}@mail.com` : null, checkInDate: `2026-0${randInt(1, 6)}-${String(randInt(1, 28)).padStart(2, '0')}`, emergencyContact: `${pick(['Wife', 'Husband', 'Brother', 'Sister', 'Mother'])} - ${phone()}`, telegramChatId: null, telegramAutoSend: Math.random() > 0.4 });
  }
  await insertAll(tenants, tenantRows);

  // --- contracts: occupy ~60% of rooms ---
  const allRoomIds = roomRows.map((r) => r.id);
  const occupied = allRoomIds.filter(() => Math.random() < 0.6);
  const roomById = Object.fromEntries(roomRows.map((r) => [r.id, r]));
  const contractRows: any[] = [];
  const contractByRoom: Record<string, any> = {};
  occupied.forEach((roomId, idx) => {
    const room = roomById[roomId];
    room.status = 'occupied';
    const rent = room.rentAmount;
    const c = { id: `cn-${idx + 1}`, roomId, tenantId: `tenant-${randInt(1, 250)}`, startDate: '2026-03-01', endDate: '2027-03-01', rentAmount: rent, depositAmount: rent * 2, electricityRate: 1000, waterRate: 2000, status: 'active' };
    contractRows.push(c);
    contractByRoom[roomId] = c;
  });
  // a few maintenance rooms among the vacant ones
  for (const r of roomRows) if (r.status === 'vacant' && Math.random() < 0.05) r.status = 'maintenance';

  await insertAll(rooms, roomRows);
  await insertAll(contracts, contractRows);

  // --- fees (50) ---
  const feeNames = [['Trash Collection', 'ថ្លៃសំរាម'], ['Parking', 'ថ្លៃចំណត'], ['Wi-Fi', 'អ៊ីនធឺណិត'], ['Security', 'សន្តិសុខ'], ['Management', 'ថ្លៃគ្រប់គ្រង'], ['Cleaning', 'ថ្លៃសម្អាត'], ['Elevator', 'ជណ្តើរយន្ត'], ['Gym', 'កន្លែងហាត់ប្រាណ']];
  const feeRows: any[] = [];
  for (let i = 1; i <= 50; i++) {
    const base = feeNames[(i - 1) % feeNames.length];
    feeRows.push({ id: `fee-${i}`, name: `${base[0]} ${i}`, nameKh: `${base[1]} ${i}`, amount: pick([2, 3, 5, 8, 10, 15, 20000, 10000, 5000]), currency: pick(['USD', 'USD', 'KHR']), active: Math.random() > 0.1, sortOrder: i });
  }
  await insertAll(fees, feeRows);

  // --- property_fees: 0-3 fees per property ---
  const pfRows: any[] = [];
  for (const p of propRows) {
    const shuffled = [...feeRows].sort(() => Math.random() - 0.5).slice(0, randInt(0, 3));
    for (const f of shuffled) pfRows.push({ propertyId: p.id, feeId: f.id, amount: Math.random() > 0.5 ? null : f.amount });
  }
  await insertAll(propertyFees, pfRows);
  const feeById = Object.fromEntries(feeRows.map((f) => [f.id, f]));
  const propFeeMap: Record<string, any[]> = {};
  for (const pf of pfRows) {
    (propFeeMap[pf.propertyId] ??= []).push(pf);
  }

  // --- user_properties: assign ~half the staff to 1-3 buildings ---
  const upRows: any[] = [];
  for (let i = 1; i <= 59; i++) {
    if (Math.random() < 0.5) {
      const props = [...propRows].sort(() => Math.random() - 0.5).slice(0, randInt(1, 3));
      for (const p of props) upRows.push({ userId: `user-${i}`, propertyId: p.id });
    }
  }
  await insertAll(userProperties, upRows);

  // --- meter readings + invoices + invoice fees (months 4,5,6 2026 per contract) ---
  const readingRows: any[] = [];
  const invoiceRows: any[] = [];
  const ifRows: any[] = [];
  const months = [4, 5, 6];
  contractRows.forEach((c) => {
    const room = roomById[c.roomId];
    let elec = randInt(800, 2000);
    let water = randInt(30, 120);
    months.forEach((m, mi) => {
      const prevElec = elec;
      const prevWater = water;
      elec += randInt(60, 160);
      water += randInt(5, 18);
      readingRows.push({ id: `mr-${c.id}-${m}`, roomId: c.roomId, readingDate: `2026-0${m}-05`, year: 2026, month: m, prevElectricityValue: prevElec, currElectricityValue: elec, prevWaterValue: prevWater, currWaterValue: water, recordedBy: pick(['Sok', 'Dara', 'AUTO GEN']) });

      const elecKHR = (elec - prevElec) * c.electricityRate;
      const waterKHR = (water - prevWater) * c.waterRate;
      const elecUSD = Number((elecKHR / EXCHANGE).toFixed(2));
      const waterUSD = Number((waterKHR / EXCHANGE).toFixed(2));

      const propFees = propFeeMap[room.propertyId] ?? [];
      let feesUSD = 0;
      const invId = `inv-${c.id}-${m}`;
      for (const pf of propFees) {
        const fee = feeById[pf.feeId];
        if (!fee || !fee.active) continue;
        const amt = pf.amount ?? fee.amount;
        const uUSD = fee.currency === 'KHR' ? Number((amt / EXCHANGE).toFixed(2)) : Number(amt.toFixed(2));
        const uKHR = fee.currency === 'KHR' ? Math.round(amt) : Math.round(amt * EXCHANGE);
        feesUSD += uUSD;
        ifRows.push({ id: `if-${invId}-${fee.id}`, invoiceId: invId, name: fee.name, nameKh: fee.nameKh, amountUSD: uUSD, amountKHR: uKHR });
      }

      const totalUSD = Number((c.rentAmount + elecUSD + waterUSD + feesUSD).toFixed(2));
      const totalKHR = Math.round(totalUSD * EXCHANGE);
      const isPast = mi < 2;
      const status = isPast ? pick(['paid', 'paid', 'partial', 'overdue']) : pick(['unpaid', 'unpaid', 'paid', 'partial']);
      const paid = status === 'paid' ? totalUSD : status === 'partial' ? Number((totalUSD / 2).toFixed(2)) : 0;
      const mm = String(m).padStart(2, '0');
      invoiceRows.push({ id: invId, invoiceNumber: `INV-2026-${mm}${room.roomNumber}`, contractId: c.id, roomId: c.roomId, tenantId: c.tenantId, year: 2026, month: m, issueDate: `2026-${mm}-12`, dueDate: `2026-${mm}-20`, rentAmountUSD: c.rentAmount, electricityPrev: prevElec, electricityCurr: elec, electricityRateKHR: c.electricityRate, electricityCostKHR: elecKHR, electricityCostUSD: elecUSD, waterPrev: prevWater, waterCurr: water, waterRateKHR: c.waterRate, waterCostKHR: waterKHR, waterCostUSD: waterUSD, totalAmountUSD: totalUSD, totalAmountKHR: totalKHR, amountPaidUSD: paid, status, khmerExchangeRate: EXCHANGE, paidDate: status === 'paid' ? `2026-${mm}-18` : null, paymentMethod: status === 'paid' ? pick(['cash', 'aba', 'wing']) : null, telegramStatus: 'unscheduled' });
    });
  });
  await insertAll(meterReadings, readingRows);
  await insertAll(invoices, invoiceRows);
  await insertAll(invoiceFees, ifRows);

  // --- tenant messages (80) & connect codes (60) ---
  const msgRows: any[] = [];
  for (let i = 1; i <= 80; i++) {
    const isTenant = Math.random() > 0.5;
    msgRows.push({ id: `msg-${i}`, tenantId: `tenant-${randInt(1, 250)}`, senderType: isTenant ? 'tenant' : 'staff', senderUserId: isTenant ? null : `user-${randInt(1, 59)}`, body: pick(['When is rent due?', 'Thank you!', 'The water is not working.', 'Invoice received.', 'Please fix the AC.', 'I will pay tomorrow.']), createdAt: new Date(Date.now() - randInt(0, 30) * 86400000).toISOString() });
  }
  await insertAll(tenantMessages, msgRows);

  const ccRows: any[] = [];
  for (let i = 1; i <= 60; i++) ccRows.push({ id: `cc-${i}`, tenantId: `tenant-${i}`, code: String(randInt(100000, 999999)), expiresAt: new Date(Date.now() + 86400000).toISOString(), usedAt: Math.random() > 0.6 ? new Date().toISOString() : null });
  await insertAll(tenantConnectCodes, ccRows);

  // --- activity logs (60) ---
  const logRows: any[] = [];
  const actions = [['Registered Tenant', 'បានចុះឈ្មោះអ្នកជួល'], ['Generated Invoice', 'បានបង្កើតវិក្កយបត្រ'], ['Recorded Payment', 'បានកត់ត្រាការបង់ប្រាក់'], ['Issued Contract', 'បានបង្កើតកិច្ចសន្យា'], ['Recorded Reading', 'បានកត់ត្រាកុងទ័រ']];
  for (let i = 1; i <= 60; i++) {
    const a = pick(actions);
    logRows.push({ id: `log-${i}`, timestamp: new Date(Date.now() - randInt(0, 60) * 86400000).toISOString(), action: a[0], actionKh: a[1], details: `${a[0]} #${i}`, detailsKh: `${a[1]} #${i}`, username: pick(['System', 'Sokdara', 'Admin']), role: 'manager' });
  }
  await insertAll(activityLogs, logRows);

  console.log('Seeded rows:');
  console.table({
    properties: propRows.length, rooms: roomRows.length, tenants: tenantRows.length,
    contracts: contractRows.length, meterReadings: readingRows.length, invoices: invoiceRows.length,
    invoiceFees: ifRows.length, roles: roleRows.length, rolePermissions: rpRows.length,
    users: userRows.length, userProperties: upRows.length, fees: feeRows.length,
    propertyFees: pfRows.length, tenantMessages: msgRows.length, tenantConnectCodes: ccRows.length,
    activityLogs: logRows.length, systemSettings: 1,
  });
  console.log('Admin login: admin@khrent.local / password123');
}

seed().then(() => { console.log('Done.'); process.exit(0); }).catch((e) => { console.error('Seed failed:', e); process.exit(1); });
