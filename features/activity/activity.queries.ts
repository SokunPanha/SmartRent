'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRent } from '@/store/rent-store';
import { activityApi } from './activity.api';

export const logKeys = { all: ['logs'] as const };

export function useLogs() {
  return useQuery({ queryKey: logKeys.all, queryFn: activityApi.list });
}

/**
 * Returns a fire-and-forget `logAction(action, actionKh, details, detailsKh)`
 * matching the legacy prop signature. The acting user is the authenticated
 * session user; the log list is refetched afterwards.
 */
export function useLogAction() {
  const qc = useQueryClient();
  const { activeRole, userName } = useRent();

  return useCallback(
    (action: string, actionKh: string, details: string, detailsKh: string) => {
      activityApi
        .create({
          action,
          actionKh,
          details,
          detailsKh,
          username: userName || 'Unknown',
          role: activeRole,
        })
        .then(() => qc.invalidateQueries({ queryKey: logKeys.all }))
        .catch(() => {
          /* logging is best-effort; ignore failures */
        });
    },
    [activeRole, userName, qc]
  );
}
