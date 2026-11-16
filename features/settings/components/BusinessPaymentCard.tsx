'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, ImagePlus, Landmark, Loader2, QrCode, RefreshCw, Save, Trash2 } from 'lucide-react';
import { SystemSettings } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { BusinessFields, paymentQrUrl, settingsApi } from '../settings.api';

export type BusinessSave = Partial<BusinessFields> & { paymentQrKey?: string | null };

const FIELDS: (keyof BusinessFields)[] = [
  'businessNameKh',
  'businessName',
  'businessPhone',
  'businessAddressKh',
  'businessAddress',
  'bankName',
  'bankAccountName',
  'bankAccountNumber',
];

function fromSettings(s: SystemSettings): BusinessFields {
  return Object.fromEntries(FIELDS.map((k) => [k, s[k] ?? ''])) as BusinessFields;
}

/**
 * Business & payment details shown on every invoice: issuer name/phone/address
 * and the bank account + payment QR tenants pay into. The parent remounts this
 * card (via `key`) whenever the saved settings change, so local edits always
 * start from the latest values.
 */
export function BusinessPaymentCard({
  settings,
  saving,
  onSave,
}: {
  settings: SystemSettings;
  saving: boolean;
  onSave: (patch: BusinessSave) => void;
}) {
  const t = useTranslations('Settings');
  const [form, setForm] = useState<BusinessFields>(() => fromSettings(settings));
  // undefined = unchanged, null = remove, string = newly uploaded key
  const [qrKey, setQrKey] = useState<string | null | undefined>(undefined);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrUploading, setQrUploading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (qrPreview) URL.revokeObjectURL(qrPreview);
    };
  }, [qrPreview]);

  const saved = fromSettings(settings);
  const changed = FIELDS.filter((k) => form[k].trim() !== saved[k]);
  const dirty = changed.length > 0 || qrKey !== undefined;

  const shownQr =
    qrKey === null ? null : qrKey ? qrPreview : settings.paymentQrKey ? paymentQrUrl(settings.paymentQrKey) : null;

  async function handleQrFile(file: File | undefined) {
    if (!file) return;
    setQrError(null);
    setQrUploading(true);
    try {
      const key = await settingsApi.uploadPaymentQr(file);
      setQrPreview(URL.createObjectURL(file));
      setQrKey(key);
    } catch (e) {
      setQrError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setQrUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function save() {
    const patch: BusinessSave = {};
    for (const k of changed) patch[k] = form[k].trim();
    if (qrKey !== undefined) patch.paymentQrKey = qrKey;
    onSave(patch);
  }

  const field = (key: keyof BusinessFields, label: string, opts: { mono?: boolean; placeholder?: string } = {}) => (
    <div>
      <label htmlFor={`biz-${key}`} className="mb-1 block text-xs font-bold text-muted-foreground">
        {label}
      </label>
      <Input
        id={`biz-${key}`}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        maxLength={200}
        placeholder={opts.placeholder}
        className={opts.mono ? 'font-mono' : undefined}
      />
    </div>
  );

  return (
    <div className="rounded-(--radius-card) border border-(--card-border) bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 md:px-5">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Building2 className="size-5 text-primary" />
            {t('business_title')}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('business_desc')}</p>
        </div>
        <button
          onClick={save}
          disabled={saving || qrUploading || !dirty}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_6px_16px_-6px_var(--primary)] transition hover:bg-primary/90 cursor-pointer disabled:opacity-40 disabled:shadow-none"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {t('save')}
        </button>
      </div>

      <div className="@container space-y-6 p-4 md:p-5">
        {/* Issuer */}
        <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
          {field('businessNameKh', t('business_name_kh'), { placeholder: 'ឧ. ផ្ទះជួល សុខសាន្ត' })}
          {field('businessName', t('business_name_en'), { placeholder: 'e.g. Sok San Rentals' })}
          {field('businessAddressKh', t('business_address_kh'))}
          {field('businessAddress', t('business_address_en'))}
          {field('businessPhone', t('business_phone'), { mono: true, placeholder: '012 345 678' })}
        </div>

        {/* Bank + QR */}
        <div className="grid grid-cols-1 gap-5 border-t border-border pt-5 @2xl:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Landmark className="size-4 text-primary" />
              {t('bank_section')}
            </h4>
            <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
              {field('bankName', t('bank_name'), { placeholder: 'ABA Bank' })}
              {field('bankAccountName', t('bank_account_name'))}
              {field('bankAccountNumber', t('bank_account_number'), { mono: true, placeholder: '000 000 000' })}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <QrCode className="size-4 text-primary" />
              {t('payment_qr')}
            </h4>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => handleQrFile(e.target.files?.[0])}
            />
            <div className="relative flex aspect-square w-full max-w-[220px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/50">
              {shownQr ? (
                // eslint-disable-next-line @next/next/no-img-element -- authenticated API image / local preview
                <img src={shownQr} alt={t('payment_qr')} className="h-full w-full bg-white object-contain p-2" />
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground cursor-pointer"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <ImagePlus className="size-5" />
                  </span>
                  <span className="text-xs font-semibold text-foreground">{t('payment_qr_upload')}</span>
                </button>
              )}
              {qrUploading && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-card/80 text-xs font-semibold">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  {t('payment_qr_uploading')}
                </div>
              )}
            </div>
            {shownQr && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  <RefreshCw className="size-3.5" />
                  {t('payment_qr_replace')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQrPreview(null);
                    setQrKey(settings.paymentQrKey ? null : undefined);
                  }}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-destructive/30 px-3.5 text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  {t('payment_qr_remove')}
                </button>
              </div>
            )}
            <p className="text-[11px] leading-snug text-muted-foreground">{t('payment_qr_hint')}</p>
            {qrError && <p className="text-xs font-medium text-destructive">{qrError}</p>}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{t('business_preview_note')}</p>
      </div>
    </div>
  );
}
