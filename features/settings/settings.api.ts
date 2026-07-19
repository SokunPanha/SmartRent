import { apiGet, apiPatch } from '@/lib/api/client';
import { SystemSettings, Property } from '@/lib/types';

export interface SettingsUpdate
  extends Partial<Pick<SystemSettings, 'exchangeRateKhr' | 'defaultElectricityRate' | 'defaultWaterRate'>> {
  /** Acting admin's own login password, re-confirmed server-side. */
  password: string;
}

export interface ZoneRatesUpdate {
  electricityRate: number | null;
  waterRate: number | null;
  password: string;
}

export const settingsApi = {
  get: () => apiGet<SystemSettings>('/api/settings'),
  update: (patch: SettingsUpdate) => apiPatch<SystemSettings>('/api/settings', patch),
  updateZoneRates: (id: string, patch: ZoneRatesUpdate) =>
    apiPatch<Property>(`/api/settings/zone-rates/${id}`, patch),
};
