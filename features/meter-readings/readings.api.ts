import { apiGet, apiPost, apiDelete } from '@/lib/api/client';
import { MeterReading } from '@/lib/types';

/** HTTP calls for the meter-readings endpoints. */
export const readingsApi = {
  list: () => apiGet<MeterReading[]>('/api/readings'),
  create: (data: MeterReading) => apiPost<MeterReading>('/api/readings', data),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/readings/${id}`),
};
