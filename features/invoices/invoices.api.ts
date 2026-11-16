import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { Invoice, Payment } from '@/lib/types';

export type PayMethod = 'cash' | 'aba' | 'wing' | 'other';

export interface GenerateResult {
  generated: number;
  /** Leases that couldn't be billed (no meter reading for the month). */
  skipped: { contractId: string; roomNumber: string; tenantName: string; reason: 'missing_reading' }[];
  invoices: Invoice[];
  period: { year: number; month: number };
}

/** A payment with its invoice context (GET /api/payments). */
export interface PaymentRow extends Payment {
  invoiceNumber: string;
  roomId: string;
  tenantId: string;
  year: number;
  month: number;
}

/** HTTP calls for invoices and the payment ledger. */
export const invoicesApi = {
  list: () => apiGet<Invoice[]>('/api/invoices'),
  /** Dates, notes only — money is derived from payments server-side. */
  update: (id: string, patch: Pick<Partial<Invoice>, 'issueDate' | 'dueDate' | 'notes'>) =>
    apiPatch<Invoice>(`/api/invoices/${id}`, patch),
  /** Only invoices without payments (e.g. to fix a reading and regenerate). */
  remove: (id: string) => apiDelete<{ id: string }>(`/api/invoices/${id}`),

  recordPayment: (id: string, payload: { amount: number; method: PayMethod; notes?: string; paidDate?: string }) =>
    apiPost<Invoice>(`/api/invoices/${id}/payment`, payload),
  payments: (id: string) => apiGet<Payment[]>(`/api/invoices/${id}/payments`),
  voidPayment: (id: string, paymentId: string, reason: string) =>
    apiPost<Invoice>(`/api/invoices/${id}/payments/${paymentId}/void`, { reason }),
  sendReceipt: (paymentId: string) => apiPost<{ message: string }>('/api/telegram/send-receipt', { paymentId }),

  /** Ledger across invoices: reports (cash received) and tenant history. */
  allPayments: (q: { from?: string; to?: string; tenantId?: string } = {}) => {
    const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]);
    return apiGet<PaymentRow[]>(`/api/payments${p.size ? `?${p}` : ''}`);
  },

  generate: (period?: { year?: number; month?: number }) =>
    apiPost<GenerateResult>('/api/invoices/generate', period ?? {}),
};
