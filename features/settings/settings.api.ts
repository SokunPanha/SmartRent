import { apiGet, apiPatch } from '@/lib/api/client';
import { SystemSettings } from '@/lib/types';

export const settingsApi = {
  get: () => apiGet<SystemSettings>('/api/settings'),
  update: (patch: Partial<Pick<SystemSettings, 'exchangeRateKhr' | 'defaultElectricityRate' | 'defaultWaterRate'>>) =>
    apiPatch<SystemSettings>('/api/settings', patch),
};
