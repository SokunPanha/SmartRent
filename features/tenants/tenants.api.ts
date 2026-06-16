import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { Tenant, Contract } from '@/lib/types';

/** HTTP calls for the tenants + contracts endpoints. */
export const tenantsApi = {
  list: () => apiGet<Tenant[]>('/api/tenants'),
  create: (data: Tenant) => apiPost<Tenant>('/api/tenants', data),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/tenants/${id}`),
};

export const contractsApi = {
  list: () => apiGet<Contract[]>('/api/contracts'),
  create: (data: Contract) => apiPost<Contract>('/api/contracts', data),
  updateStatus: (id: string, status: 'active' | 'suspended' | 'expired') =>
    apiPatch<Contract>(`/api/contracts/${id}`, { status }),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/contracts/${id}`),
};
