/**
 * Catalog of capabilities that can be granted to a role. Roles themselves are
 * dynamic (created by a super admin); this list is the fixed set of things the
 * application knows how to gate.
 */
export const PERMISSION_KEYS = [
  'properties.manage',
  'tenants.manage',
  'readings.manage',
  'invoices.generate',
  'invoices.pay',
  'admin.access',
  'admin.settings',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export interface PermissionMeta {
  key: PermissionKey;
  label: string;
  description: string;
}

export const PERMISSION_META: PermissionMeta[] = [
  { key: 'properties.manage', label: 'Manage Properties & Rooms', description: 'Add, edit and delete properties and rooms.' },
  { key: 'tenants.manage', label: 'Manage Tenants & Contracts', description: 'Register tenants and issue / terminate leases.' },
  { key: 'readings.manage', label: 'Record Meter Readings', description: 'Log electricity and water meter readings.' },
  { key: 'invoices.generate', label: 'Generate Invoices', description: 'Run the monthly invoice generator.' },
  { key: 'invoices.pay', label: 'Record Payments', description: 'Log rent / utility payments against invoices.' },
  { key: 'admin.access', label: 'Administer Users & Roles', description: 'Manage user accounts, roles and permissions.' },
  { key: 'admin.settings', label: 'Configure System Settings', description: 'Set the USD/KHR exchange rate and default utility prices.' },
];

export function isPermissionKey(value: string): value is PermissionKey {
  return (PERMISSION_KEYS as readonly string[]).includes(value);
}

export const SUPER_ADMIN_ROLE_NAME = 'Super Admin';
