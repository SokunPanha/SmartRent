'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { rolesApi, NewRoleInput, UpdateRoleInput } from './roles.api';
import { myPermissionKeys } from './permissions.queries';

export const roleKeys = { all: ['roles'] as const };

export function useRoles() {
  return useQuery({ queryKey: roleKeys.all, queryFn: rolesApi.list });
}

export function useRoleMutations() {
  const t = useTranslations('Admin');
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: roleKeys.all });
    // A permission change can affect the current user's own access.
    qc.invalidateQueries({ queryKey: myPermissionKeys.all });
  };

  const create = useMutation({
    mutationFn: (data: NewRoleInput) => rolesApi.create(data),
    onSuccess: (r) => {
      invalidate();
      toast(t('toast_role_created', { name: r.name }));
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; patch: UpdateRoleInput }) => rolesApi.update(vars.id, vars.patch),
    onSuccess: () => {
      invalidate();
      toast(t('toast_role_updated'));
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast(t('toast_role_deleted'));
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, update, remove };
}
