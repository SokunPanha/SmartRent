'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { feesApi, NewFeeInput, UpdateFeeInput, PropertyFee } from './fees.api';

export const feeKeys = {
  all: ['fees'] as const,
  property: (id: string) => ['property-fees', id] as const,
};

export function useFees() {
  return useQuery({ queryKey: feeKeys.all, queryFn: feesApi.list });
}

export function useFeeMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: feeKeys.all });

  const create = useMutation({
    mutationFn: (data: NewFeeInput) => feesApi.create(data),
    onSuccess: () => {
      invalidate();
      toast('Fee added');
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; patch: UpdateFeeInput }) => feesApi.update(vars.id, vars.patch),
    onSuccess: () => {
      invalidate();
      toast('Fee updated');
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => feesApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast('Fee deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, update, remove };
}

export function usePropertyFees(propertyId: string | null) {
  return useQuery({
    queryKey: feeKeys.property(propertyId ?? ''),
    queryFn: () => feesApi.getPropertyFees(propertyId as string),
    enabled: !!propertyId,
  });
}

export function useUpdatePropertyFees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { propertyId: string; fees: PropertyFee[] }) =>
      feesApi.setPropertyFees(vars.propertyId, vars.fees),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: feeKeys.property(vars.propertyId) });
      toast('Building fees saved');
    },
    onError: (e) => toast.error(e.message),
  });
}
