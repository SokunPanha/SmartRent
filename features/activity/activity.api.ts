import { apiGet, apiPost } from '@/lib/api/client';
import { ActivityLog } from '@/lib/types';

export type NewActivityLog = Pick<
  ActivityLog,
  'action' | 'actionKh' | 'details' | 'detailsKh' | 'username' | 'role'
>;

/** HTTP calls for the activity-log endpoints. */
export const activityApi = {
  list: () => apiGet<ActivityLog[]>('/api/logs'),
  create: (data: NewActivityLog) => apiPost<ActivityLog>('/api/logs', data),
};
