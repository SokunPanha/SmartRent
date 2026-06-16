import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { Invoice } from '@/lib/types';

export interface GenerateResult {
  generated: number;
  autoReadings: number;
  invoices: Invoice[];
}

/** HTTP calls for the invoices endpoints, including the two domain operations. */
export const invoicesApi = {
  list: () => apiGet<Invoice[]>('/api/invoices'),
  update: (id: string, patch: Partial<Invoice>) => apiPatch<Invoice>(`/api/invoices/${id}`, patch),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/invoices/${id}`),

  recordPayment: (
    id: string,
    payload: { amount: number; method: 'cash' | 'aba' | 'wing' | 'other'; notes?: string }
  ) => apiPost<Invoice>(`/api/invoices/${id}/payment`, payload),

  generate: (period?: { year?: number; month?: number }) =>
    apiPost<GenerateResult>('/api/invoices/generate', period ?? {}),
};
