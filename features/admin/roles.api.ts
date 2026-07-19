import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { PermissionKey } from '@/lib/permissions';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: PermissionKey[];
}

export interface NewRoleInput {
  name: string;
  description?: string;
  permissions?: PermissionKey[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: PermissionKey[];
}

export const rolesApi = {
  list: () => apiGet<Role[]>('/api/roles'),
  create: (data: NewRoleInput) => apiPost<Role>('/api/roles', data),
  update: (id: string, patch: UpdateRoleInput) => apiPatch<Role>(`/api/roles/${id}`, patch),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/roles/${id}`),
};
