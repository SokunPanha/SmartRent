'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Coins, Plus, SquarePen } from 'lucide-react';
import { DeleteButton } from '@/components/shared/DeleteButton';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';
import { formatUSD, formatKHR } from '@/lib/format';
import { AppLanguage } from '@/lib/types';
import { pickLocale } from '@/lib/i18n';
import { useFees, useFeeMutations } from '../fees.queries';
import { Fee } from '../fees.api';
import { FeeFormModal } from './FeeFormModal';

/** The system-wide catalog of custom flat fees (CRUD). */
export function FeeCatalogCard({ lang }: { lang: AppLanguage }) {
  const t = useTranslations('Settings');
  const confirm = useConfirm();
  const { data: fees = [], isLoading } = useFees();
  const { create, update, remove } = useFeeMutations();
  const [showCreate, setShowCreate] = useState(false);
  const [editFee, setEditFee] = useState<Fee | null>(null);

  const busy = create.isPending || update.isPending || remove.isPending;

  async function handleDelete(fee: Fee) {
    const ok = await confirm({
      title: `Delete "${pickLocale(lang, fee.name, fee.nameKh)}"?`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (ok) remove.mutate(fee.id);
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card">
      <div className="p-4 border-b border-border flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground font-sans flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-primary" />
            {t('fees_title')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">{t('fees_desc')}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t('add_fee')}
        </button>
      </div>

      <div className="p-4">
        {isLoading ? (
          <p className="py-6 text-center text-sm italic text-muted-foreground">{t('loading')}</p>
        ) : fees.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-muted-foreground">{t('no_fees')}</p>
        ) : (
          <div className="divide-y divide-border">
            {fees.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {pickLocale(lang, fee.name, fee.nameKh)}
                    </span>
                    {!fee.active && (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                        {t('inactive_badge')}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {fee.currency === 'USD' ? formatUSD(fee.amount) : formatKHR(fee.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    title={t('edit_fee_title')}
                    disabled={busy}
                    onClick={() => setEditFee(fee)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-40 cursor-pointer"
                  >
                    <SquarePen className="w-4 h-4" />
                  </button>
                  <DeleteButton onClick={() => handleDelete(fee)} disabled={busy} size="md" title="Delete" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <FeeFormModal
          busy={create.isPending}
          onClose={() => setShowCreate(false)}
          onSubmit={(d) => create.mutate(d, { onSuccess: () => setShowCreate(false) })}
        />
      )}
      {editFee && (
        <FeeFormModal
          fee={editFee}
          busy={update.isPending}
          onClose={() => setEditFee(null)}
          onSubmit={(d) => update.mutate({ id: editFee.id, patch: d }, { onSuccess: () => setEditFee(null) })}
        />
      )}
    </div>
  );
}
