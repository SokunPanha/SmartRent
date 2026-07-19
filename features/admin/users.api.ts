import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';

export interface AdminUser {
  id: string;
  name: string;
  nameKh?: string | null;
  email: string;
  phone?: string | null;
  position?: string | null;
  active: boolean;
  preferredLang?: string | null;
  roleId: string | null;
  roleName: string | null;
  isSystemRole: boolean | null;
  createdAt?: string;
  /** Assigned building IDs. Empty = unrestricted (sees every building). */
  propertyIds: string[];
}

export interface NewUserInput {
  name: string;
  nameKh?: string;
  email: string;
  password: string;
  roleId: string;
  phone?: string;
  position?: string;
  preferredLang?: string;
  propertyIds?: string[];
}

export interface UpdateUserInput {
  name?: string;
  nameKh?: string;
  email?: string;
  phone?: string;
  position?: string;
  active?: boolean;
  preferredLang?: string;
  roleId?: string;
  password?: string;
  propertyIds?: string[];
}

export const usersApi = {
  list: () => apiGet<AdminUser[]>('/api/users'),
  create: (data: NewUserInput) => apiPost<AdminUser>('/api/users', data),
  update: (id: string, patch: UpdateUserInput) => apiPatch<AdminUser>(`/api/users/${id}`, patch),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/users/${id}`),
};
