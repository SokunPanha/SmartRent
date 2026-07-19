import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from '@/lib/api/client';

export interface Fee {
  id: string;
  name: string;
  nameKh: string;
  amount: number;
  currency: string; // 'USD' | 'KHR'
  active: boolean;
  sortOrder: number;
}

export interface NewFeeInput {
  name: string;
  nameKh: string;
  amount: number;
  currency: string;
  active?: boolean;
}

export type UpdateFeeInput = Partial<NewFeeInput>;

export interface PropertyFee {
  feeId: string;
  amount: number | null; // null = use catalog default
}

export const feesApi = {
  list: () => apiGet<Fee[]>('/api/settings/fees'),
  create: (data: NewFeeInput) => apiPost<Fee>('/api/settings/fees', data),
  update: (id: string, patch: UpdateFeeInput) => apiPatch<Fee>(`/api/settings/fees/${id}`, patch),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/settings/fees/${id}`),
  getPropertyFees: (propertyId: string) =>
    apiGet<PropertyFee[]>(`/api/settings/property-fees/${propertyId}`),
  setPropertyFees: (propertyId: string, fees: PropertyFee[]) =>
    apiPut<PropertyFee[]>(`/api/settings/property-fees/${propertyId}`, { fees }),
};
