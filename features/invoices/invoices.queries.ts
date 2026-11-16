'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { readingKeys } from '@/features/meter-readings/readings.queries';
import { contractKeys } from '@/features/tenants/tenants.queries';
import { invoicesApi, PayMethod } from './invoices.api';

export const invoiceKeys = { all: ['invoices'] as const };
export const paymentKeys = {
  all: ['payments'] as const,
  invoice: (id: string) => ['payments', 'invoice', id] as const,
  ledger: (q: object) => ['payments', 'ledger', q] as const,
};

export function useInvoices() {
  return useQuery({ queryKey: invoiceKeys.all, queryFn: invoicesApi.list });
}

/** One invoice's payment ledger (enabled while its payment dialog is open). */
export function useInvoicePayments(invoiceId: string | null) {
  return useQuery({
    queryKey: paymentKeys.invoice(invoiceId ?? ''),
    queryFn: () => invoicesApi.payments(invoiceId!),
    enabled: !!invoiceId,
  });
}

/** Payments across invoices (reports: cash received; tenant history). */
export function usePaymentsLedger(q: { from?: string; to?: string; tenantId?: string }, enabled = true) {
  return useQuery({ queryKey: paymentKeys.ledger(q), queryFn: () => invoicesApi.allPayments(q), enabled });
}

export function useInvoiceMutations() {
  const qc = useQueryClient();
  const t = useTranslations('Invoices');
  const refresh = () => {
    qc.invalidateQueries({ queryKey: invoiceKeys.all });
    qc.invalidateQueries({ queryKey: paymentKeys.all });
    qc.invalidateQueries({ queryKey: contractKeys.all }); // deposit status follows move-in payments
  };

  const recordPayment = useMutation({
    mutationFn: (vars: { invoiceId: string; amount: number; method: PayMethod; notes?: string; paidDate?: string }) =>
      invoicesApi.recordPayment(vars.invoiceId, {
        amount: vars.amount,
        method: vars.method,
        notes: vars.notes,
        paidDate: vars.paidDate,
      }),
    onSuccess: () => {
      refresh();
      toast.success(t('payment_recorded'));
    },
    onError: (e) => toast.error(e.message),
  });

  const voidPayment = useMutation({
    mutationFn: (vars: { invoiceId: string; paymentId: string; reason: string }) =>
      invoicesApi.voidPayment(vars.invoiceId, vars.paymentId, vars.reason),
    onSuccess: () => {
      refresh();
      toast.success(t('payment_voided'));
    },
    onError: (e) => toast.error(e.message),
  });

  const sendReceipt = useMutation({
    mutationFn: (paymentId: string) => invoicesApi.sendReceipt(paymentId),
    onSuccess: () => toast.success(t('receipt_sent')),
    onError: (e) => toast.error(e.message),
  });

  const deleteInvoice = useMutation({
    mutationFn: (id: string) => invoicesApi.remove(id),
    onSuccess: () => {
      refresh();
      toast.success(t('invoice_deleted'));
    },
    onError: (e) => toast.error(e.message),
  });

  const generate = useMutation({
    mutationFn: (period?: { year?: number; month?: number }) => invoicesApi.generate(period),
    onSuccess: (res) => {
      refresh();
      qc.invalidateQueries({ queryKey: readingKeys.all });
      const message =
        res.generated > 0 ? t('generated_count', { count: res.generated }) : t('generated_none');
      if (res.skipped.length) {
        toast.warning(message, {
          description: t('generated_skipped', {
            count: res.skipped.length,
            rooms: res.skipped.map((s) => `${s.roomNumber} (${s.tenantName})`).join(', '),
          }),
          duration: 15000,
        });
      } else {
        toast.success(message);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  return { recordPayment, voidPayment, sendReceipt, deleteInvoice, generate };
}
