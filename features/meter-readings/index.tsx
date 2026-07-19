'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MeterReading, Room, Property, UserRole, AppLanguage } from '@/lib/types';
import {
  getMonthNames,
  sortReadings,
  filterReadings,
  getAvailableYears,
} from './meter-readings.helpers';
import { useCan } from '@/features/admin/permissions.queries';
import { useReadingForm } from './use-reading-form';
import { ReadingFilters, RoleBanner } from './components/ReadingFilters';
import { ReadingsTable } from './components/ReadingsTable';
import { RecordReadingModal } from './components/RecordReadingModal';

interface MeterReadingsProps {
  readings: MeterReading[];
  rooms: Room[];
  properties: Property[];
  activeRole: UserRole;
  lang: AppLanguage;
  onAddReading: (reading: MeterReading) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

export default function MeterReadings({
  readings,
  rooms,
  properties,
  activeRole,
  lang,
  onAddReading,
  logAction,
}: MeterReadingsProps) {
  const t = useTranslations('MeterReadings');
  const can = useCan();
  const canModify = can('readings.manage');

  const [selectedPropId, setSelectedPropId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const monthNames = useMemo(() => getMonthNames(t), [t]);
  const availableYears = useMemo(() => getAvailableYears(readings), [readings]);

  const filteredReadings = useMemo(
    () => filterReadings(sortReadings(readings), rooms, selectedPropId, selectedMonth, selectedYear),
    [readings, rooms, selectedPropId, selectedMonth, selectedYear]
  );

  const form = useReadingForm({
    readings,
    rooms,
    canModify,
    activeRole,
    lang,
    onAddReading,
    logAction,
  });

  return (
    <div className="space-y-6" id="meter-readings-component">
      {!canModify && <RoleBanner activeRole={activeRole} lang={lang} />}

      <ReadingFilters
        properties={properties}
        monthNames={monthNames}
        selectedPropId={selectedPropId}
        onSelectProp={setSelectedPropId}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        availableYears={availableYears}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        canModify={canModify}
        onRecord={form.openModal}
        lang={lang}
      />

      <ReadingsTable
        readings={filteredReadings}
        rooms={rooms}
        properties={properties}
        monthNames={monthNames}
        lang={lang}
      />

      <RecordReadingModal
        form={form}
        rooms={rooms}
        properties={properties}
        monthNames={monthNames}
        lang={lang}
      />
    </div>
  );
}
