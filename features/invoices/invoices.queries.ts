'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Invoice } from '@/lib/types';
import { readingKeys } from '@/features/meter-readings/readings.queries';
import { invoicesApi } from './invoices.api';

export const invoiceKeys = { all: ['invoices'] as const };

export function useInvoices() {
  return useQuery({ queryKey: invoiceKeys.all, queryFn: invoicesApi.list });
}

export function useInvoiceMutations() {
  const qc = useQueryClient();

  const recordPayment = useMutation({
    mutationFn: (vars: {
      invoiceId: string;
      amount: number;
      method: 'cash' | 'aba' | 'wing' | 'other';
      notes?: string;
    }) =>
      invoicesApi.recordPayment(vars.invoiceId, {
        amount: vars.amount,
        method: vars.method,
        notes: vars.notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
      toast('Payment transaction captured!');
    },
    onError: (e) => toast.error(e.message),
  });

  const generate = useMutation({
    mutationFn: (period?: { year?: number; month?: number }) => invoicesApi.generate(period),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
      qc.invalidateQueries({ queryKey: readingKeys.all });
      toast(
        res.generated > 0
          ? `Successfully compiled ${res.generated} invoice(s)!`
          : 'All active rooms already have invoices for this period.'
      );
    },
    onError: (e) => toast.error(e.message),
  });

  return { recordPayment, generate };
}

/**
 * Bridges the legacy `onUpdateInvoices(fullArray)` contract used by the Telegram
 * dispatch flow. It updates the cache immediately (optimistic UI), then persists
 * only the invoices that actually changed via PATCH, and refetches.
 */
export function useUpdateInvoices() {
  const qc = useQueryClient();

  return useCallback(
    async (next: Invoice[]) => {
      const prev = qc.getQueryData<Invoice[]>(invoiceKeys.all) ?? [];
      qc.setQueryData(invoiceKeys.all, next);

      const prevById = new Map(prev.map((i) => [i.id, i]));
      const changed = next.filter(
        (i) => JSON.stringify(prevById.get(i.id)) !== JSON.stringify(i)
      );

      try {
        await Promise.all(
          changed.map((i) =>
            invoicesApi.update(i.id, {
              status: i.status,
              notes: i.notes,
              paidDate: i.paidDate,
              paymentMethod: i.paymentMethod,
              amountPaidUSD: i.amountPaidUSD,
              telegramScheduledDate: i.telegramScheduledDate,
              telegramSentDate: i.telegramSentDate,
              telegramStatus: i.telegramStatus,
              telegramError: i.telegramError,
            })
          )
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to update invoices');
      } finally {
        qc.invalidateQueries({ queryKey: invoiceKeys.all });
      }
    },
    [qc]
  );
}
