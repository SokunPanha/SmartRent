'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { expensesApi, ExpenseInput } from './expenses.api';

export const expenseKeys = { all: ['expenses'] as const, range: (q: object) => ['expenses', q] as const };

export function useExpenses(q: { from?: string; to?: string } = {}) {
  return useQuery({ queryKey: expenseKeys.range(q), queryFn: () => expensesApi.list(q) });
}

export function useExpenseMutations() {
  const qc = useQueryClient();
  const t = useTranslations('Expenses');
  const refresh = () => qc.invalidateQueries({ queryKey: expenseKeys.all });
  const create = useMutation({
    mutationFn: (data: ExpenseInput) => expensesApi.create(data),
    onSuccess: () => {
      refresh();
      toast.success(t('saved'));
    },
    onError: (e) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExpenseInput> }) => expensesApi.update(id, data),
    onSuccess: () => {
      refresh();
      toast.success(t('saved'));
    },
    onError: (e) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => {
      refresh();
      toast.success(t('deleted'));
    },
    onError: (e) => toast.error(e.message),
  });
  return { create, update, remove };
}
