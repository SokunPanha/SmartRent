'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { AppLanguage } from '@/lib/types';
import { pickLocale } from '@/lib/i18n';
import { useFees, usePropertyFees, useUpdatePropertyFees } from '../fees.queries';
import { Fee, PropertyFee } from '../fees.api';

/**
 * Pick which catalog fees a building charges + optional per-building amount.
 * Outer component fetches; the inner form only mounts once data is loaded, so
 * its useState initializes correctly from the fetched values (no sync effect).
 */
export function PropertyFeesModal({
  propertyId,
  propertyName,
  lang,
  onClose,
}: {
  propertyId: string;
  propertyName: string;
  lang: AppLanguage;
  onClose: () => void;
}) {
  const t = useTranslations('Settings');
  const { data: catalog, isLoading: catalogLoading } = useFees();
  const { data: current, isLoading: currentLoading } = usePropertyFees(propertyId);
  const updateMut = useUpdatePropertyFees();
  const ready = !catalogLoading && !currentLoading && catalog && current;

  return (
    <Modal open onClose={onClose} size="sm">
      <ModalHeader title={t('building_fees_title')} onClose={onClose} />
      {!ready ? (
        <div className="p-8 text-center text-sm italic text-muted-foreground">{t('loading')}</div>
      ) : (
        <PropertyFeesForm
          catalog={catalog!.filter((f) => f.active)}
          current={current!}
          propertyName={propertyName}
          lang={lang}
          busy={updateMut.isPending}
          onClose={onClose}
          onSave={(fees) => updateMut.mutate({ propertyId, fees }, { onSuccess: onClose })}
        />
      )}
    </Modal>
  );
}

function PropertyFeesForm({
  catalog,
  current,
  propertyName,
  lang,
  busy,
  onClose,
  onSave,
}: {
  catalog: Fee[];
  current: PropertyFee[];
  propertyName: string;
  lang: AppLanguage;
  busy: boolean;
  onClose: () => void;
  onSave: (fees: PropertyFee[]) => void;
}) {
  const t = useTranslations('Settings');
  const [sel, setSel] = useState<Record<string, { on: boolean; amount: string }>>(() => {
    const currentMap = new Map(current.map((c) => [c.feeId, c.amount]));
    const init: Record<string, { on: boolean; amount: string }> = {};
    for (const f of catalog) {
      const has = currentMap.has(f.id);
      const amt = currentMap.get(f.id);
      init[f.id] = { on: has, amount: amt != null ? String(amt) : '' };
    }
    return init;
  });

  const toggle = (id: string) => setSel((s) => ({ ...s, [id]: { ...s[id], on: !s[id].on } }));
  const setAmt = (id: string, v: string) => setSel((s) => ({ ...s, [id]: { ...s[id], amount: v } }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fees: PropertyFee[] = catalog
      .filter((f) => sel[f.id]?.on)
      .map((f) => ({
        feeId: f.id,
        amount: sel[f.id].amount.trim() === '' ? null : Number(sel[f.id].amount),
      }));
    onSave(fees);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{propertyName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t('building_fees_desc')}</p>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto">
        {catalog.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">{t('no_fees')}</p>
        ) : (
          catalog.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sel[f.id]?.on ?? false}
                  onChange={() => toggle(f.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-foreground">{pickLocale(lang, f.name, f.nameKh)}</span>
                <span className="text-[11px] font-mono text-muted-foreground">({f.currency})</span>
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                disabled={!sel[f.id]?.on}
                value={sel[f.id]?.amount ?? ''}
                onChange={(e) => setAmt(f.id, e.target.value)}
                placeholder={t('use_default')}
                className="h-8 w-28 rounded-lg border border-input bg-card px-2 font-mono text-xs focus:border-primary focus:outline-none disabled:opacity-40"
              />
            </div>
          ))
        )}
      </div>
      <ModalFooter cancelLabel={t('cancel')} onCancel={onClose} submitLabel={t('save')} submitDisabled={busy} />
    </form>
  );
}
