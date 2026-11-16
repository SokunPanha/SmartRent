'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Input } from '@/components/ui/input';
import { Fee, NewFeeInput } from '../fees.api';

/** Create or edit a catalog fee. `fee` present = edit mode. */
export function FeeFormModal({
  fee,
  busy,
  onClose,
  onSubmit,
}: {
  fee?: Fee;
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: NewFeeInput) => void;
}) {
  const t = useTranslations('Settings');
  const [name, setName] = useState(fee?.name ?? '');
  const [nameKh, setNameKh] = useState(fee?.nameKh ?? '');
  const [amount, setAmount] = useState<number>(fee?.amount ?? 0);
  const [currency, setCurrency] = useState(fee?.currency ?? 'USD');
  const [active, setActive] = useState(fee?.active ?? true);

  const valid = name.trim() && nameKh.trim() && Number.isFinite(amount) && amount >= 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ name: name.trim(), nameKh: nameKh.trim(), amount: Number(amount), currency, active });
  }

  return (
    <Modal open onClose={onClose} size="sm">
      <ModalHeader title={fee ? t('edit_fee_title') : t('create_fee_title')} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <Field label={`${t('fee_name_en')} *`}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Trash Collection" required />
        </Field>
        <Field label={`${t('fee_name_kh')} *`}>
          <Input value={nameKh} onChange={(e) => setNameKh(e.target.value)} placeholder="ឧ. ថ្លៃសំរាម" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`${t('fee_amount')} *`}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="font-mono"
            />
          </Field>
          <Field label={t('fee_currency')}>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-card px-4 font-sans text-sm focus:border-primary focus:outline-none"
            >
              <option value="USD">USD</option>
              <option value="KHR">KHR</option>
            </select>
          </Field>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          {t('fee_active')}
        </label>
        <ModalFooter
          cancelLabel={t('cancel')}
          onCancel={onClose}
          submitLabel={t('save')}
          submitDisabled={busy || !valid}
        />
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-sans text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
