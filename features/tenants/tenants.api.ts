import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { Tenant, Contract } from '@/lib/types';

export type TelegramConnectCode = { code: string; expiresAt: string; deepLink: string | null };

export type TenantMessage = {
  id: string;
  tenantId: string;
  senderType: 'tenant' | 'staff';
  senderUserId: string | null;
  body: string;
  createdAt: string;
};

/** HTTP calls for the tenants + contracts endpoints. */
export const tenantsApi = {
  list: () => apiGet<Tenant[]>('/api/tenants'),
  create: (data: Tenant) => apiPost<Tenant>('/api/tenants', data),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/tenants/${id}`),
  generateTelegramCode: (id: string) =>
    apiPost<TelegramConnectCode>(`/api/tenants/${id}/telegram-code`),
  getMessages: (id: string) => apiGet<TenantMessage[]>(`/api/tenants/${id}/messages`),
  sendMessage: (id: string, body: string) =>
    apiPost<TenantMessage>(`/api/tenants/${id}/messages`, { body }),
};

export const contractsApi = {
  list: () => apiGet<Contract[]>('/api/contracts'),
  create: (data: Contract) => apiPost<Contract>('/api/contracts', data),
  updateStatus: (id: string, status: 'active' | 'suspended' | 'expired') =>
    apiPatch<Contract>(`/api/contracts/${id}`, { status }),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/contracts/${id}`),
};
