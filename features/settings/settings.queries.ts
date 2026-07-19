'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRent } from '@/store/rent-store';
import { settingsApi } from './settings.api';

export const settingsKeys = { all: ['system-settings'] as const };

/** System-wide exchange rate + default utility prices. Rarely changes, so a long staleTime is fine. */
export function useSettings() {
  const { mounted } = useRent();
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: settingsApi.get,
    enabled: mounted,
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.all });
      toast('System settings saved!');
    },
    onError: (e) => toast.error(e.message),
  });
}
