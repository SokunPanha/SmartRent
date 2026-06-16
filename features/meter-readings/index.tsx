'use client';

import { useMemo, useState } from 'react';
import { MeterReading, Room, Property, UserRole, AppLanguage } from '@/lib/types';
import {
  getMonthNames,
  sortReadings,
  filterReadings,
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
  t: any;
  onAddReading: (reading: MeterReading) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

export default function MeterReadings({
  readings,
  rooms,
  properties,
  activeRole,
  lang,
  t,
  onAddReading,
  logAction,
}: MeterReadingsProps) {
  const can = useCan();
  const canModify = can('readings.manage');

  const [selectedPropId, setSelectedPropId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const monthNames = useMemo(() => getMonthNames(lang), [lang]);

  const filteredReadings = useMemo(
    () => filterReadings(sortReadings(readings), rooms, selectedPropId, selectedMonth),
    [readings, rooms, selectedPropId, selectedMonth]
  );

  const form = useReadingForm({
    readings,
    rooms,
    canModify,
    activeRole,
    lang,
    t,
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
        canModify={canModify}
        onRecord={form.openModal}
        t={t}
        lang={lang}
      />

      <ReadingsTable
        readings={filteredReadings}
        rooms={rooms}
        properties={properties}
        monthNames={monthNames}
        t={t}
        lang={lang}
      />

      <RecordReadingModal
        form={form}
        rooms={rooms}
        properties={properties}
        monthNames={monthNames}
        t={t}
        lang={lang}
      />
    </div>
  );
}
