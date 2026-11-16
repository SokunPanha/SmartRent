import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { MeterReading } from '@/lib/types';

export type NewReading = MeterReading & { meterReplaced?: boolean };
export type ReadingPatch = Partial<
  Pick<MeterReading, 'prevElectricityValue' | 'currElectricityValue' | 'prevWaterValue' | 'currWaterValue' | 'readingDate'>
> & { meterReplaced?: boolean };

/** HTTP calls for the meter-readings endpoints. */
export const readingsApi = {
  list: () => apiGet<MeterReading[]>('/api/readings'),
  create: (data: NewReading) => apiPost<MeterReading>('/api/readings', data),
  /** Correcting a reading also updates its unpaid invoice (server-side). */
  update: (id: string, patch: ReadingPatch) =>
    apiPatch<MeterReading & { updatedInvoice: string | null }>(`/api/readings/${id}`, patch),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/readings/${id}`),
};
