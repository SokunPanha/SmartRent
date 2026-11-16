import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client';
import { Expense } from '@/lib/types';

export type ExpenseInput = Pick<Expense, 'date' | 'category' | 'description' | 'amountUSD' | 'propertyId'>;

export const expensesApi = {
  list: (q: { from?: string; to?: string } = {}) => {
    const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]);
    return apiGet<Expense[]>(`/api/expenses${p.size ? `?${p}` : ''}`);
  },
  create: (data: ExpenseInput) => apiPost<Expense>('/api/expenses', data),
  update: (id: string, data: Partial<ExpenseInput>) => apiPatch<Expense>(`/api/expenses/${id}`, data),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/expenses/${id}`),
};
