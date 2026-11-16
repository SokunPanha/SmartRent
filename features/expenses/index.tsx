'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Pencil, Plus, Trash2, Wrench } from 'lucide-react';
import { AppLanguage, Expense, ExpenseCategory, Property } from '@/lib/types';
import { pickLocale } from '@/lib/i18n';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination, usePagination } from '@/components/shared/Pagination';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';
import { useCan } from '@/features/admin/permissions.queries';
import { useExpenseMutations, useExpenses } from './expenses.queries';

const CATEGORIES: ExpenseCategory[] = ['repair', 'cleaning', 'utilities', 'tax', 'salary', 'other'];
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** /expenses — operating costs (repairs, cleaning, owner-paid utilities …)
 *  that reports subtract from cash received to show profit. */
export default function ExpensesView({ properties, lang }: { properties: Property[]; lang: AppLanguage }) {
  const t = useTranslations('Expenses');
  const can = useCan();
  const canManage = can('expenses.manage');
  const confirm = useConfirm();
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [building, setBuilding] = useState('all');
  const { data: expenses = [], isLoading } = useExpenses({ from: `${year}-01-01`, to: `${year}-12-31` });
  const m = useExpenseMutations();
  const [editing, setEditing] = useState<Expense | 'new' | null>(null);

  const rows = useMemo(
    () => (building === 'all' ? expenses : expenses.filter((e) => (e.propertyId ?? 'general') === building)),
    [expenses, building]
  );
  const total = rows.reduce((s, e) => s + e.amountUSD, 0);
  const { page, totalPages, pageRows, setPage, pageSize } = usePagination(rows, 15);
  const propName = (id: string | null) => {
    const p = properties.find((x) => x.id === id);
    return p ? pickLocale(lang, p.name, p.nameKh) : t('general');
  };

  return (
    <div className="space-y-5" id="expenses-container">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{t('title')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-10 rounded-full border border-(--card-border) bg-card px-4 text-sm shadow-card"
          >
            {Array.from({ length: 6 }, (_, i) => thisYear - i).map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="h-10 max-w-56 rounded-full border border-(--card-border) bg-card px-4 text-sm shadow-card"
          >
            <option value="all">{t('all_buildings')}</option>
            <option value="general">{t('general')}</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {pickLocale(lang, p.name, p.nameKh)}
              </option>
            ))}
          </select>
          {canManage && (
            <button
              onClick={() => setEditing('new')}
              className="flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_6px_16px_-6px_var(--primary)] hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="size-4" />
              {t('add')}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-(--radius-card) border border-(--card-border) bg-card p-5 shadow-card">
        <p className="text-xs text-muted-foreground">{t('total_for_year', { year })}</p>
        <p className="mt-1 font-mono text-2xl font-bold text-foreground">${total.toFixed(2)}</p>
      </div>

      {isLoading ? null : rows.length === 0 ? (
        <EmptyState icon={Wrench} title={t('empty')} className="p-12" />
      ) : (
        <div className="overflow-hidden rounded-(--radius-card) border border-(--card-border) bg-card shadow-card">
          <div className="scroll-x-hint overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="p-3 pl-5 text-left font-semibold">{t('date')}</th>
                  <th className="p-3 text-left font-semibold">{t('category')}</th>
                  <th className="p-3 text-left font-semibold">{t('description')}</th>
                  <th className="p-3 text-left font-semibold">{t('building')}</th>
                  <th className="p-3 text-right font-semibold">{t('amount')}</th>
                  {canManage && <th className="p-3 pr-5" />}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 last:border-0">
                    <td className="p-3 pl-5 font-mono text-muted-foreground">{e.date}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                        {t(`cat_${e.category}`)}
                      </span>
                    </td>
                    <td className="max-w-72 truncate p-3 text-foreground">{e.description}</td>
                    <td className="max-w-48 truncate p-3 text-muted-foreground">{propName(e.propertyId)}</td>
                    <td className="p-3 text-right font-mono font-semibold">${e.amountUSD.toFixed(2)}</td>
                    {canManage && (
                      <td className="p-3 pr-5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditing(e)}
                            aria-label={t('edit')}
                            className="flex size-9 items-center justify-center rounded-full border border-border hover:bg-muted cursor-pointer"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (await confirm({ title: t('delete_confirm'), confirmLabel: t('delete'), variant: 'destructive' })) {
                                m.remove.mutate(e.id);
                              }
                            }}
                            aria-label={t('delete')}
                            className="flex size-9 items-center justify-center rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} totalItems={rows.length} pageSize={pageSize} onPageChange={setPage} />
        </div>
      )}

      {editing && (
        <ExpenseForm
          expense={editing === 'new' ? null : editing}
          properties={properties}
          lang={lang}
          busy={m.create.isPending || m.update.isPending}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            const opts = { onSuccess: () => setEditing(null) };
            if (editing === 'new') m.create.mutate(data, opts);
            else m.update.mutate({ id: editing.id, data }, opts);
          }}
        />
      )}
    </div>
  );
}

function ExpenseForm({
  expense,
  properties,
  lang,
  busy,
  onClose,
  onSave,
}: {
  expense: Expense | null;
  properties: Property[];
  lang: AppLanguage;
  busy: boolean;
  onClose: () => void;
  onSave: (data: Pick<Expense, 'date' | 'category' | 'description' | 'amountUSD' | 'propertyId'>) => void;
}) {
  const t = useTranslations('Expenses');
  const [date, setDate] = useState(expense?.date ?? localToday());
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? 'repair');
  const [description, setDescription] = useState(expense?.description ?? '');
  const [amount, setAmount] = useState<number | ''>(expense?.amountUSD ?? '');
  const [propertyId, setPropertyId] = useState<string>(expense?.propertyId ?? '');
  const field = 'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm';

  return (
    <Modal open onClose={onClose} size="sm">
      <ModalHeader title={expense ? t('edit') : t('add')} onClose={onClose} />
      <form
        className="space-y-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (amount === '') return;
          onSave({ date, category, description, amountUSD: Number(amount), propertyId: propertyId || null });
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('date')} *</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('amount')} *</span>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className={`${field} font-mono`}
              required
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('category')} *</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className={field}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`cat_${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('description')} *</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            placeholder={t('description_placeholder')}
            className={field}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('building')}</span>
          <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={field}>
            <option value="">{t('general')}</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {pickLocale(lang, p.name, p.nameKh)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-semibold text-primary-foreground cursor-pointer disabled:opacity-50"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {t('save')}
        </button>
      </form>
    </Modal>
  );
}
