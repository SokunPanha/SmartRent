'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CalendarPlus, CheckCircle2, DoorOpen, Loader2, Pause, Play, Trash2 } from 'lucide-react';
import { Contract, Room } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useReadings } from '@/features/meter-readings/readings.queries';
import { useContractMutations } from '../tenants.queries';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const money = (v: number) => `$${v.toFixed(2)}`;

/** Deposit lifecycle badge: pending → held → settled (refund shown). */
export function DepositBadge({ contract }: { contract: Contract }) {
  const t = useTranslations('Tenants');
  if (!contract.depositAmount) return null;
  if (contract.depositStatus === 'settled') {
    return (
      <StatusBadge tone="info">
        {t('deposit_settled', { refund: money(contract.depositRefundUSD ?? 0) })}
      </StatusBadge>
    );
  }
  if (contract.depositStatus === 'pending') return <StatusBadge tone="warning">{t('deposit_pending')}</StatusBadge>;
  return <StatusBadge tone="success">{t('deposit_held')}</StatusBadge>;
}

/**
 * Per-lease actions: renew, move out (final reading + final invoice +
 * deposit settlement), mark deposit received, suspend / resume billing, and
 * delete (only for leases without invoices — the server enforces it).
 */
export function LeaseActions({
  contract,
  room,
  canModify,
  onDelete,
}: {
  contract: Contract;
  room: Room | undefined;
  canModify: boolean;
  onDelete?: (id: string) => void;
}) {
  const t = useTranslations('Tenants');
  const m = useContractMutations();
  const [renewOpen, setRenewOpen] = useState(false);
  const [moveOutOpen, setMoveOutOpen] = useState(false);
  if (!canModify) return null;

  const closed = !!contract.moveOutDate || contract.depositStatus === 'settled';
  const occupying = contract.status === 'active' || contract.status === 'suspended';
  const btn =
    'inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-muted cursor-pointer disabled:opacity-50';

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {contract.depositStatus === 'pending' && contract.depositAmount > 0 && (
        <button
          className={btn}
          disabled={m.update.isPending}
          onClick={() =>
            m.update.mutate(
              { id: contract.id, patch: { depositStatus: 'held' } },
              { onSuccess: () => toast.success(t('deposit_marked_received')) }
            )
          }
        >
          <CheckCircle2 className="size-3.5 text-chart-2" />
          {t('deposit_received_action')}
        </button>
      )}
      {!closed && (
        <button className={btn} onClick={() => setRenewOpen(true)}>
          <CalendarPlus className="size-3.5 text-primary" />
          {t('renew')}
        </button>
      )}
      {/* Also for leases that expired on their own: settles the deposit and
          records the final reading. */}
      {!closed && (
        <button className={btn} onClick={() => setMoveOutOpen(true)}>
          <DoorOpen className="size-3.5 text-destructive" />
          {t('move_out')}
        </button>
      )}
      {occupying && !closed && (
        <button
          className={btn}
          disabled={m.update.isPending}
          title={contract.status === 'active' ? t('suspend_hint') : undefined}
          onClick={() =>
            m.update.mutate({
              id: contract.id,
              patch: { status: contract.status === 'active' ? 'suspended' : 'active' },
            })
          }
        >
          {contract.status === 'active' ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {contract.status === 'active' ? t('suspend') : t('resume')}
        </button>
      )}
      {onDelete && (
        <button
          className={cn(btn, 'w-9 justify-center px-0 text-destructive')}
          title={t('delete_lease_hint')}
          aria-label={t('delete_lease_hint')}
          onClick={() => onDelete(contract.id)}
        >
          <Trash2 className="size-3.5" />
        </button>
      )}

      {renewOpen && <RenewModal contract={contract} onClose={() => setRenewOpen(false)} />}
      {moveOutOpen && <MoveOutModal contract={contract} room={room} onClose={() => setMoveOutOpen(false)} />}
    </div>
  );
}

function RenewModal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const t = useTranslations('Tenants');
  const { renew } = useContractMutations();
  const base = contract.endDate > today() ? contract.endDate : today();
  const plusYear = `${Number(base.slice(0, 4)) + 1}${base.slice(4)}`;
  const [endDate, setEndDate] = useState(plusYear);
  const [rent, setRent] = useState<number>(contract.rentAmount);

  return (
    <Modal open onClose={onClose} size="sm">
      <ModalHeader title={t('renew_title')} onClose={onClose} />
      <form
        className="space-y-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          renew.mutate(
            { id: contract.id, endDate, rentAmount: rent !== contract.rentAmount ? rent : undefined },
            {
              onSuccess: () => {
                toast.success(t('renewed', { date: endDate }));
                onClose();
              },
            }
          );
        }}
      >
        <p className="text-xs text-muted-foreground">{t('renew_current', { date: contract.endDate })}</p>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('renew_new_end')} *</span>
          <input
            type="date"
            value={endDate}
            min={base}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('renew_rent')}</span>
          <input
            type="number"
            min={1}
            step={1}
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
            className="h-11 w-full rounded-xl border border-input bg-card px-4 font-mono text-sm font-bold"
            required
          />
        </label>
        <button
          type="submit"
          disabled={renew.isPending}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-semibold text-primary-foreground cursor-pointer disabled:opacity-50"
        >
          {renew.isPending && <Loader2 className="size-4 animate-spin" />}
          {t('renew')}
        </button>
      </form>
    </Modal>
  );
}

function MoveOutModal({ contract, room, onClose }: { contract: Contract; room: Room | undefined; onClose: () => void }) {
  const t = useTranslations('Tenants');
  const { moveOut } = useContractMutations();
  const { data: readings = [] } = useReadings();
  const last = useMemo(
    () =>
      readings
        .filter((r) => r.roomId === contract.roomId)
        .sort((a, b) => b.year - a.year || b.month - a.month || b.readingDate.localeCompare(a.readingDate))[0],
    [readings, contract.roomId]
  );
  const [date, setDate] = useState(today() < contract.endDate ? today() : contract.endDate);
  const [elec, setElec] = useState<number | ''>('');
  const [water, setWater] = useState<number | ''>('');
  const [deduction, setDeduction] = useState<number>(0);
  const [note, setNote] = useState('');
  const [apply, setApply] = useState(true);
  const held = contract.depositStatus === 'held' ? contract.depositAmount : 0;
  const available = Math.max(0, held - (deduction || 0));

  return (
    <Modal open onClose={onClose} size="md">
      <ModalHeader title={t('move_out_title', { room: room?.roomNumber ?? '' })} onClose={onClose} />
      <form
        className="space-y-4 p-4 md:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (elec === '' || water === '') return;
          moveOut.mutate(
            {
              id: contract.id,
              body: {
                moveOutDate: date,
                finalElectricity: Number(elec),
                finalWater: Number(water),
                deductionUSD: deduction || 0,
                deductionNote: note || undefined,
                applyDepositToBalance: apply,
              },
            },
            {
              onSuccess: (res) => {
                toast.success(t('moved_out'), {
                  description: t('moved_out_summary', {
                    applied: money(res.deposit.applied),
                    refund: money(res.deposit.refund),
                  }),
                  duration: 12000,
                });
                onClose();
              },
            }
          );
        }}
      >
        <p className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">{t('move_out_explain')}</p>

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('move_out_date')} *</span>
          <input
            type="date"
            value={date}
            min={contract.startDate}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm"
            required
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ['final_electricity', elec, setElec, last?.currElectricityValue],
              ['final_water', water, setWater, last?.currWaterValue],
            ] as const
          ).map(([key, value, set, prev]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-bold text-muted-foreground">{t(key)} *</span>
              <input
                type="number"
                min={prev ?? 0}
                step="any"
                value={value}
                onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={prev !== undefined ? String(prev) : ''}
                className="h-11 w-full rounded-xl border border-input bg-card px-4 font-mono text-sm"
                required
              />
              {prev !== undefined && (
                <span className="mt-1 block text-[11px] text-muted-foreground">{t('last_reading', { value: prev })}</span>
              )}
            </label>
          ))}
        </div>

        <div className="space-y-3 rounded-2xl border border-border p-4">
          <p className="text-sm font-semibold text-foreground">
            {t('deposit_held_amount', { amount: money(held) })}
          </p>
          {held > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[140px_1fr]">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('deduction')}</span>
                  <input
                    type="number"
                    min={0}
                    max={held}
                    step={0.01}
                    value={deduction}
                    onChange={(e) => setDeduction(Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-input bg-card px-4 font-mono text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">{t('deduction_note')}</span>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('deduction_note_placeholder')}
                    className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm"
                  />
                </label>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={apply} onChange={(e) => setApply(e.target.checked)} className="mt-0.5 size-4" />
                <span>
                  {t('apply_deposit')}
                  <span className="block text-xs text-muted-foreground">{t('apply_deposit_help')}</span>
                </span>
              </label>
              <p className="text-xs text-muted-foreground">{t('deposit_available', { amount: money(available) })}</p>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={moveOut.isPending}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-destructive text-sm font-semibold text-destructive-foreground cursor-pointer disabled:opacity-50"
        >
          {moveOut.isPending && <Loader2 className="size-4 animate-spin" />}
          {t('confirm_move_out')}
        </button>
      </form>
    </Modal>
  );
}
