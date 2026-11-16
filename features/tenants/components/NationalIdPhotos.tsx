'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { IdCard } from 'lucide-react';
import { Tenant } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { nationalIdImageUrl } from '../tenants.api';
import { NationalIdUpload } from './NationalIdUpload';

/** Tenant detail card showing the photo of the back of the ID card. Staff with
 *  tenants.manage can add it when missing (older tenants) or replace it. */
export function NationalIdPhotos({
  tenant,
  canModify,
  onSave,
}: {
  tenant: Tenant;
  canModify: boolean;
  onSave: (patch: Partial<Tenant> & { id: string }) => Promise<unknown>;
}) {
  const t = useTranslations('Tenants');
  const key = tenant.nationalIdBack ?? null;
  const src = key ? nationalIdImageUrl(tenant.id, key) : null;

  async function save(newKey: string | null) {
    if (!newKey) return;
    await onSave({ id: tenant.id, nationalIdBack: newKey });
    toast.success(t('id_image_saved'));
  }

  return (
    <section className="bg-card border border-(--card-border) rounded-(--radius-card) shadow-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
          <IdCard className="size-5 text-primary" />
          {t('id_card_photos')}
        </h3>
        {!key && <StatusBadge tone="warning">{t('id_missing')}</StatusBadge>}
      </div>

      <div className="max-w-sm">
        {canModify ? (
          <NationalIdUpload
            label={t('id_back')}
            value={key}
            existingSrc={src}
            // Errors are already toasted by the update mutation.
            onChange={(k) => void save(k).catch(() => undefined)}
            invalid={!key}
          />
        ) : (
          <div className="flex aspect-[1.586] items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/50 text-xs text-muted-foreground">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element -- authenticated API image
              <img src={src} alt={t('id_card_photos')} className="h-full w-full object-cover" />
            ) : (
              t('id_missing')
            )}
          </div>
        )}
      </div>
    </section>
  );
}
