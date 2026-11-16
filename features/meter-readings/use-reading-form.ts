'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { MeterReading, Room, UserRole, AppLanguage } from '@/lib/types';
import { getRoomNumber } from './meter-readings.helpers';
import { NewReading, ReadingPatch } from './readings.api';

interface UseReadingFormArgs {
  readings: MeterReading[];
  rooms: Room[];
  canModify: boolean;
  activeRole: UserRole;
  lang: AppLanguage;
  onAddReading: (reading: NewReading) => void;
  onUpdateReading: (id: string, patch: ReadingPatch) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * The record / edit meter reading form. "Previous" values continue from the
 * room's reading for the month before (locked, so usage can't be changed by
 * editing them) unless "Meter replaced" is ticked. One reading per room per
 * month; existing ones are edited instead.
 */
export function useReadingForm({
  readings,
  rooms,
  canModify,
  activeRole,
  onAddReading,
  onUpdateReading,
  logAction,
}: UseReadingFormArgs) {
  const t = useTranslations('MeterReadings');
  const tCommon = useTranslations('Common');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetRoomId, setTargetRoomId] = useState('');
  const [readingYear, setReadingYear] = useState<number>(() => new Date().getFullYear());
  const [readingMonth, setReadingMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [prevElec, setPrevElec] = useState<number>(0);
  const [currElec, setCurrElec] = useState<number>(0);
  const [prevWater, setPrevWater] = useState<number>(0);
  const [currWater, setCurrWater] = useState<number>(0);
  const [meterReplaced, setMeterReplaced] = useState(false);

  /** Latest reading of the room before the given month. */
  function priorReading(roomId: string, year: number, month: number, excludeId?: string | null) {
    return readings
      .filter(
        (r) =>
          r.roomId === roomId &&
          r.id !== excludeId &&
          (r.year < year || (r.year === year && r.month < month))
      )
      .sort((a, b) => b.year - a.year || b.month - a.month)[0];
  }

  const prior = targetRoomId ? priorReading(targetRoomId, readingYear, readingMonth, editingId) : undefined;
  /** Previous values are fixed by last month's reading unless the meter was replaced. */
  const prevLocked = !!prior && !meterReplaced;

  function applyPrior(roomId: string, year: number, month: number) {
    const p = priorReading(roomId, year, month, null);
    const pe = p?.currElectricityValue ?? 0;
    const pw = p?.currWaterValue ?? 0;
    setPrevElec(pe);
    setPrevWater(pw);
    setCurrElec(pe); // usage starts at 0 — staff enter the real meter value
    setCurrWater(pw);
    setMeterReplaced(false);
  }

  function handleRoomSelectionChange(roomId: string) {
    setTargetRoomId(roomId);
    applyPrior(roomId, readingYear, readingMonth);
  }

  function changePeriod(year: number, month: number) {
    setReadingYear(year);
    setReadingMonth(month);
    if (targetRoomId && !editingId) applyPrior(targetRoomId, year, month);
  }

  function openModal() {
    setEditingId(null);
    const now = new Date();
    setReadingYear(now.getFullYear());
    setReadingMonth(now.getMonth() + 1);
    const occupied = rooms.filter((r) => r.status === 'occupied');
    const first = occupied[0] ?? rooms[0];
    if (first) {
      setTargetRoomId(first.id);
      const p = priorReading(first.id, now.getFullYear(), now.getMonth() + 1, null);
      setPrevElec(p?.currElectricityValue ?? 0);
      setPrevWater(p?.currWaterValue ?? 0);
      setCurrElec(p?.currElectricityValue ?? 0);
      setCurrWater(p?.currWaterValue ?? 0);
    }
    setMeterReplaced(false);
    setShowModal(true);
  }

  function openEdit(r: MeterReading) {
    setEditingId(r.id);
    setTargetRoomId(r.roomId);
    setReadingYear(r.year);
    setReadingMonth(r.month);
    setPrevElec(r.prevElectricityValue);
    setCurrElec(r.currElectricityValue);
    setPrevWater(r.prevWaterValue);
    setCurrWater(r.currWaterValue);
    const p = priorReading(r.roomId, r.year, r.month, r.id);
    // Already out of step with last month (e.g. meter swapped) → keep editable.
    setMeterReplaced(
      !!p && (p.currElectricityValue !== r.prevElectricityValue || p.currWaterValue !== r.prevWaterValue)
    );
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canModify) {
      toast.error(tCommon('insufficient_permissions'));
      return;
    }
    if (!targetRoomId || !readingYear || !readingMonth) {
      toast.error(tCommon('please_fill'));
      return;
    }
    if (currElec < prevElec) {
      toast.error(t('error_elec_less'));
      return;
    }
    if (currWater < prevWater) {
      toast.error(t('error_water_less'));
      return;
    }

    const roomNum = getRoomNumber(rooms, targetRoomId);
    if (editingId) {
      onUpdateReading(editingId, {
        prevElectricityValue: Number(prevElec),
        currElectricityValue: Number(currElec),
        prevWaterValue: Number(prevWater),
        currWaterValue: Number(currWater),
        meterReplaced,
      });
      logAction(
        'Corrected Meter Reading',
        'បានកែតម្លៃកុងទ័រ',
        `Corrected Electricity/Water levels for Room ${roomNum} (${readingYear}-${readingMonth})`,
        `បានកែលេខកុងទ័រទឹកភ្លើងសម្រាប់បន្ទប់ ${roomNum} (${readingYear}-${readingMonth})`
      );
    } else {
      const duplicate = readings.some(
        (r) =>
          r.roomId === targetRoomId &&
          r.year === Number(readingYear) &&
          r.month === Number(readingMonth) &&
          (r.kind ?? 'regular') === 'regular'
      );
      if (duplicate) {
        toast.error(t('duplicate_reading', { month: readingMonth, year: readingYear }));
        return;
      }
      onAddReading({
        id: 'mr-' + Date.now(),
        roomId: targetRoomId,
        readingDate: localToday(),
        year: Number(readingYear),
        month: Number(readingMonth),
        prevElectricityValue: Number(prevElec),
        currElectricityValue: Number(currElec),
        prevWaterValue: Number(prevWater),
        currWaterValue: Number(currWater),
        recordedBy: activeRole.toUpperCase(),
        meterReplaced,
      });
      logAction(
        'Recorded Meter Readings',
        'បានកត់ត្រាតម្លៃកុងទ័រ',
        `Logged Electricity/Water levels for Room ${roomNum} (Month ${readingMonth})`,
        `បានកត់ត្រាលេខកុងទ័រទឹកភ្លើងសម្រាប់បន្ទប់ ${roomNum} (ខែទី ${readingMonth})`
      );
    }

    setTargetRoomId('');
    setEditingId(null);
    setShowModal(false);
  }

  return {
    showModal,
    openModal,
    openEdit,
    closeModal,
    editing: !!editingId,
    targetRoomId,
    handleRoomSelectionChange,
    readingYear,
    setReadingYear: (y: number) => changePeriod(y, readingMonth),
    readingMonth,
    setReadingMonth: (m: number) => changePeriod(readingYear, m),
    prevElec,
    setPrevElec,
    currElec,
    setCurrElec,
    prevWater,
    setPrevWater,
    currWater,
    setCurrWater,
    meterReplaced,
    setMeterReplaced,
    prevLocked,
    priorPeriod: prior ? `${prior.year}-${String(prior.month).padStart(2, '0')}` : null,
    submit,
  };
}
