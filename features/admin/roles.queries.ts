'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PermissionKey } from '@/lib/permissions';
import { rolesApi } from './roles.api';
import { myPermissionKeys } from './permissions.queries';

export const roleKeys = { all: ['roles'] as const };

export function useRoles() {
  return useQuery({ queryKey: roleKeys.all, queryFn: rolesApi.list });
}

export function useRoleMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: roleKeys.all });
    // A permission change can affect the current user's own access.
    qc.invalidateQueries({ queryKey: myPermissionKeys.all });
  };

  const create = useMutation({
    mutationFn: (data: { name: string; permissions?: PermissionKey[] }) => rolesApi.create(data),
    onSuccess: (r) => {
      invalidate();
      toast(`Created role "${r.name}"`);
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; patch: { name?: string; permissions?: PermissionKey[] } }) =>
      rolesApi.update(vars.id, vars.patch),
    onSuccess: () => {
      invalidate();
      toast('Role updated');
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast('Role deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, update, remove };
}
