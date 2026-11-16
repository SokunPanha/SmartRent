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

/** Authenticated URL for a tenant's ID photo (back of the card). `key` busts
 *  the browser cache when the photo is replaced. */
export function nationalIdImageUrl(tenantId: string, key: string) {
  return `/api/tenants/${encodeURIComponent(tenantId)}/national-id?v=${encodeURIComponent(key)}`;
}

/** Uploads the ID photo (multipart) and returns its storage key. */
async function uploadNationalIdImage(file: Blob): Promise<string> {
  const form = new FormData();
  form.append('file', file, 'national-id.jpg');
  const res = await fetch('/api/tenants/national-id-images', { method: 'POST', body: form });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || `Upload failed (${res.status})`);
  return json.data.key as string;
}

/** HTTP calls for the tenants + contracts endpoints. */
export const tenantsApi = {
  list: () => apiGet<Tenant[]>('/api/tenants'),
  create: (data: Tenant) => apiPost<Tenant>('/api/tenants', data),
  update: ({ id, ...patch }: Partial<Tenant> & { id: string }) =>
    apiPatch<Tenant>(`/api/tenants/${id}`, patch),
  uploadNationalIdImage,
  remove: (id: string) => apiDelete<{ id: string }>(`/api/tenants/${id}`),
  generateTelegramCode: (id: string) =>
    apiPost<TelegramConnectCode>(`/api/tenants/${id}/telegram-code`),
  getMessages: (id: string) => apiGet<TenantMessage[]>(`/api/tenants/${id}/messages`),
  sendMessage: (id: string, body: string) =>
    apiPost<TenantMessage>(`/api/tenants/${id}/messages`, { body }),
};

/** New lease payload: rates null = follow the building/system rate. */
export type NewContract = Omit<Contract, 'depositStatus'> & {
  createMoveInInvoice?: boolean;
  depositReceived?: boolean;
};

export interface MoveOutPayload {
  moveOutDate: string;
  finalElectricity: number;
  finalWater: number;
  deductionUSD?: number;
  deductionNote?: string;
  applyDepositToBalance?: boolean;
}

export interface MoveOutResult {
  contract: Contract;
  finalInvoiceId: string | null;
  deposit: { held: number; deduction: number; applied: number; refund: number };
}

export const contractsApi = {
  list: () => apiGet<Contract[]>('/api/contracts'),
  create: (data: NewContract) => apiPost<Contract>('/api/contracts', data),
  update: (id: string, patch: Partial<Pick<Contract, 'status' | 'depositStatus' | 'rentAmount' | 'electricityRate' | 'waterRate'>>) =>
    apiPatch<Contract>(`/api/contracts/${id}`, patch),
  renew: (id: string, body: { endDate: string; rentAmount?: number }) =>
    apiPost<Contract>(`/api/contracts/${id}/renew`, body),
  moveOut: (id: string, body: MoveOutPayload) => apiPost<MoveOutResult>(`/api/contracts/${id}/move-out`, body),
  updateStatus: (id: string, status: 'active' | 'suspended' | 'expired') =>
    apiPatch<Contract>(`/api/contracts/${id}`, { status }),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/contracts/${id}`),
};
