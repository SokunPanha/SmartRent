'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRent } from '@/store/rent-store';
import { PermissionKey } from '@/lib/permissions';
import { permissionsApi } from './permissions.api';

export const myPermissionKeys = { all: ['my-permissions'] as const };

/** The signed-in user's effective permissions (super admin => all). */
export function useMyPermissions() {
  const { mounted } = useRent();
  return useQuery({
    queryKey: myPermissionKeys.all,
    queryFn: permissionsApi.me,
    enabled: mounted,
    staleTime: 60_000,
  });
}

/**
 * Returns `can(permission)` for the current user. Super admins always pass.
 * While permissions load, non-super-admins are treated as having none (the UI
 * simply hides actions until the real set arrives).
 */
export function useCan() {
  const { isSuperAdmin } = useRent();
  const { data } = useMyPermissions();
  return useCallback(
    (key: PermissionKey) => {
      if (isSuperAdmin || data?.isSuperAdmin) return true;
      return !!data?.permissions?.includes(key);
    },
    [isSuperAdmin, data]
  );
}
