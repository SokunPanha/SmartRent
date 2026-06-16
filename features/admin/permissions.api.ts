import { apiGet } from '@/lib/api/client';
import { PermissionKey } from '@/lib/permissions';

export interface MyPermissions {
  isSuperAdmin: boolean;
  permissions: PermissionKey[];
}

export const permissionsApi = {
  me: () => apiGet<MyPermissions>('/api/permissions/me'),
};
