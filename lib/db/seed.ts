import bcrypt from 'bcryptjs';
import { db } from './index';
import {
  properties,
  rooms,
  tenants,
  contracts,
  meterReadings,
  invoices,
  activityLogs,
  users,
  roles,
  rolePermissions,
} from './schema';
import { PERMISSION_KEYS, SUPER_ADMIN_ROLE_NAME } from '../permissions';
import {
  DEFAULT_PROPERTIES,
  DEFAULT_ROOMS,
  DEFAULT_TENANTS,
  DEFAULT_CONTRACTS,
  DEFAULT_METER_READINGS,
  DEFAULT_INVOICES,
  DEFAULT_LOGS,
} from '../data';

/**
 * Seed the database from the static defaults in `lib/data.ts`.
 *
 * Idempotent: every table is truncated first, then re-inserted, so running the
 * script repeatedly yields the same baseline dataset.
 */
const DEFAULT_PASSWORD = 'password123';
const SUPER_ADMIN_ROLE_ID = 'role-super-admin';
const SUPER_ADMIN_EMAIL = 'admin@khrent.local';

async function seed() {
  console.log('Seeding database...');

  // Seed ONLY the protected Super Admin role + one admin account. All other
  // roles are created by the super admin at runtime.
  await db.delete(rolePermissions);
  await db.delete(users);
  await db.delete(roles);

  await db.insert(roles).values({
    id: SUPER_ADMIN_ROLE_ID,
    name: SUPER_ADMIN_ROLE_NAME,
    isSystem: true,
  });
  // Grant the system role every permission (it also bypasses checks in code).
  await db.insert(rolePermissions).values(
    PERMISSION_KEYS.map((permission) => ({ roleId: SUPER_ADMIN_ROLE_ID, permission }))
  );

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  await db.insert(users).values({
    id: 'user-admin',
    name: 'System Administrator',
    nameKh: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ',
    email: SUPER_ADMIN_EMAIL,
    roleId: SUPER_ADMIN_ROLE_ID,
    passwordHash,
  });

  // Truncate in dependency-free order (no FKs declared, so order is cosmetic).
  await db.delete(invoices);
  await db.delete(meterReadings);
  await db.delete(contracts);
  await db.delete(rooms);
  await db.delete(tenants);
  await db.delete(properties);
  await db.delete(activityLogs);

  await db.insert(properties).values(DEFAULT_PROPERTIES);
  await db.insert(rooms).values(DEFAULT_ROOMS);
  await db.insert(tenants).values(DEFAULT_TENANTS);
  await db.insert(contracts).values(DEFAULT_CONTRACTS);
  await db.insert(meterReadings).values(DEFAULT_METER_READINGS);
  await db.insert(invoices).values(DEFAULT_INVOICES);
  await db.insert(activityLogs).values(DEFAULT_LOGS);

  console.log(
    `Seeded: Super Admin role + admin user, ${DEFAULT_PROPERTIES.length} properties, ${DEFAULT_ROOMS.length} rooms, ` +
      `${DEFAULT_TENANTS.length} tenants, ${DEFAULT_CONTRACTS.length} contracts, ` +
      `${DEFAULT_METER_READINGS.length} readings, ${DEFAULT_INVOICES.length} invoices, ` +
      `${DEFAULT_LOGS.length} logs.`
  );
  console.log(`Super Admin login: ${SUPER_ADMIN_EMAIL} (password: ${DEFAULT_PASSWORD})`);
}

seed()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
