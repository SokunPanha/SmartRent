import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { PermissionKey } from '@/lib/permissions';

export interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: PermissionKey[];
}

export const rolesApi = {
  list: () => apiGet<Role[]>('/api/roles'),
  create: (data: { name: string; permissions?: PermissionKey[] }) => apiPost<Role>('/api/roles', data),
  update: (id: string, patch: { name?: string; permissions?: PermissionKey[] }) =>
    apiPatch<Role>(`/api/roles/${id}`, patch),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/roles/${id}`),
};
