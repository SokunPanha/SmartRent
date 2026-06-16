'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roomKeys } from '@/features/properties/properties.queries';
import { tenantsApi, contractsApi } from './tenants.api';

export const tenantKeys = { all: ['tenants'] as const };
export const contractKeys = { all: ['contracts'] as const };

export function useTenants() {
  return useQuery({ queryKey: tenantKeys.all, queryFn: tenantsApi.list });
}

export function useContracts() {
  return useQuery({ queryKey: contractKeys.all, queryFn: contractsApi.list });
}

export function useTenantMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: tenantsApi.create,
    onSuccess: (tenant) => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
      toast(`Registered tenant ${tenant.name}!`);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: tenantsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
      toast('Tenant deleted.');
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, remove };
}

/** Contract mutations also touch room status, so rooms are invalidated too. */
export function useContractMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: contractKeys.all });
    qc.invalidateQueries({ queryKey: roomKeys.all });
  };

  const create = useMutation({
    mutationFn: contractsApi.create,
    onSuccess: () => {
      invalidate();
      toast('Lease validation completed: Room marked Occupied!');
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' | 'expired' }) =>
      contractsApi.updateStatus(id, status),
    onSuccess: (_data, vars) => {
      invalidate();
      toast(`Lease status updated to: ${vars.status.toUpperCase()}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: contractsApi.remove,
    onSuccess: () => {
      invalidate();
      toast('Contract removed');
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, updateStatus, remove };
}
