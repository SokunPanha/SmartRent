'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { readingsApi } from './readings.api';

export const readingKeys = { all: ['readings'] as const };

export function useReadings() {
  return useQuery({ queryKey: readingKeys.all, queryFn: readingsApi.list });
}

export function useReadingMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: readingsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: readingKeys.all });
      toast('Meter reading logs created successfully!');
    },
    onError: (e) => toast.error(e.message),
  });

  return { create };
}
