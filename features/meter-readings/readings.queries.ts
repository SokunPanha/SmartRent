'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { readingsApi, ReadingPatch } from './readings.api';

export const readingKeys = { all: ['readings'] as const }
export function useReadings() {
  return useQuery({ queryKey: readingKeys.all, queryFn: readingsApi.list });
}

export function useReadingMutations() {
  const qc = useQueryClient();
  const t = useTranslations('MeterReadings');

  const create = useMutation({
    mutationFn: readingsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: readingKeys.all });
      toast.success(t('reading_saved'));
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ReadingPatch }) => readingsApi.update(id, patch),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: readingKeys.all });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(
        res.updatedInvoice ? t('reading_updated_invoice', { number: res.updatedInvoice }) : t('reading_updated')
      );
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, update };
}
