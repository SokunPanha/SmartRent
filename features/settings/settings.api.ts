import { apiGet, apiPatch } from '@/lib/api/client';
import { SystemSettings, Property } from '@/lib/types';

export interface SettingsUpdate
  extends Partial<
    Pick<SystemSettings, 'exchangeRateKhr' | 'defaultElectricityRate' | 'defaultWaterRate' | 'invoiceIssueDay' | 'invoiceDueDay'>
  > {
  /** Acting admin's own login password, re-confirmed server-side. */
  password: string;
}

/** Editable business & payment fields (strings; '' clears a field). */
export type BusinessFields = {
  businessName: string;
  businessNameKh: string;
  businessPhone: string;
  businessAddress: string;
  businessAddressKh: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
};

export interface BusinessUpdate extends Partial<BusinessFields> {
  /** Key from uploadPaymentQr, or null to remove the QR; omit to keep it. */
  paymentQrKey?: string | null;
  password: string;
}

/** Uploads a payment QR image (multipart) and returns its storage key. */
async function uploadPaymentQr(file: Blob): Promise<string> {
  const form = new FormData();
  form.append('file', file, 'payment-qr.png');
  const res = await fetch('/api/settings/payment-qr', { method: 'POST', body: form });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || `Upload failed (${res.status})`);
  return json.data.key as string;
}

/** URL of the current payment QR; `key` busts the cache when it changes. */
export const paymentQrUrl = (key: string) => `/api/settings/payment-qr?v=${encodeURIComponent(key)}`;

export interface ZoneRatesUpdate {
  electricityRate: number | null;
  waterRate: number | null;
  password: string;
}

export const settingsApi = {
  get: () => apiGet<SystemSettings>('/api/settings'),
  update: (patch: SettingsUpdate) => apiPatch<SystemSettings>('/api/settings', patch),
  updateBusiness: (patch: BusinessUpdate) => apiPatch<SystemSettings>('/api/settings/business', patch),
  uploadPaymentQr,
  updateZoneRates: (id: string, patch: ZoneRatesUpdate) =>
    apiPatch<Property>(`/api/settings/zone-rates/${id}`, patch),
};
