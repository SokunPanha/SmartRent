'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { MeterReading, Room, UserRole, AppLanguage } from '@/lib/types';
import { getRoomNumber } from './meter-readings.helpers';

interface UseReadingFormArgs {
  readings: MeterReading[];
  rooms: Room[];
  canModify: boolean;
  activeRole: UserRole;
  lang: AppLanguage;
  onAddReading: (reading: MeterReading) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** Encapsulates the "record meter reading" modal form: fields, auto-suggest, validation and submit. */
export function useReadingForm({
  readings,
  rooms,
  canModify,
  activeRole,
  lang,
  onAddReading,
  logAction,
}: UseReadingFormArgs) {
  const t = useTranslations('MeterReadings');
  const tCommon = useTranslations('Common');
  const [showModal, setShowModal] = useState(false);
  const [targetRoomId, setTargetRoomId] = useState('');
  const [readingYear, setReadingYear] = useState<number>(2026);
  const [readingMonth, setReadingMonth] = useState<number>(6);
  const [prevElec, setPrevElec] = useState<number>(0);
  const [currElec, setCurrElec] = useState<number>(0);
  const [prevWater, setPrevWater] = useState<number>(0);
  const [currWater, setCurrWater] = useState<number>(0);

  // Auto-suggest meter values from the room's latest recorded reading.
  function handleRoomSelectionChange(roomId: string) {
    setTargetRoomId(roomId);
    const roomReadings = readings.filter((r) => r.roomId === roomId);
    if (roomReadings.length > 0) {
      const latest = [...roomReadings].sort((a, b) =>
        b.year !== a.year ? b.year - a.year : b.month - a.month
      )[0];
      setPrevElec(latest.currElectricityValue);
      setCurrElec(latest.currElectricityValue + 10);
      setPrevWater(latest.currWaterValue);
      setCurrWater(latest.currWaterValue + 2);
    } else {
      setPrevElec(0);
      setCurrElec(10);
      setPrevWater(0);
      setCurrWater(5);
    }
  }

  function openModal() {
    const occupied = rooms.filter((r) => r.status === 'occupied');
    if (occupied.length > 0) handleRoomSelectionChange(occupied[0].id);
    else if (rooms.length > 0) handleRoomSelectionChange(rooms[0].id);
    setReadingYear(2026);
    setReadingMonth(6);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
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
    const duplicate = readings.some(
      (r) =>
        r.roomId === targetRoomId &&
        r.year === Number(readingYear) &&
        r.month === Number(readingMonth)
    );
    if (duplicate) {
      toast.error(t('duplicate_reading', { month: readingMonth, year: readingYear }));
      return;
    }

    const newReading: MeterReading = {
      id: 'mr-' + Date.now(),
      roomId: targetRoomId,
      readingDate: new Date().toISOString().split('T')[0],
      year: Number(readingYear),
      month: Number(readingMonth),
      prevElectricityValue: Number(prevElec),
      currElectricityValue: Number(currElec),
      prevWaterValue: Number(prevWater),
      currWaterValue: Number(currWater),
      recordedBy: activeRole.toUpperCase(),
    };

    onAddReading(newReading);

    const roomNum = getRoomNumber(rooms, targetRoomId);
    logAction(
      'Recorded Meter Readings',
      'បានកត់ត្រាតម្លៃកុងទ័រ',
      `Logged Electricity/Water levels for Room ${roomNum} (Month ${readingMonth})`,
      `បានកត់ត្រាលេខកុងទ័រទឹកភ្លើងសម្រាប់បន្ទប់ ${roomNum} (ខែទី ${readingMonth})`
    );

    setTargetRoomId('');
    setShowModal(false);
  }

  return {
    showModal,
    openModal,
    closeModal,
    targetRoomId,
    handleRoomSelectionChange,
    readingYear,
    setReadingYear,
    readingMonth,
    setReadingMonth,
    prevElec,
    setPrevElec,
    currElec,
    setCurrElec,
    prevWater,
    setPrevWater,
    currWater,
    setCurrWater,
    submit,
  };
}
