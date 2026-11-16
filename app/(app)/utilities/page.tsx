'use client';

import MeterReadings from '@/features/meter-readings';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useReadings, useReadingMutations } from '@/features/meter-readings/readings.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function UtilitiesPage() {
  const { activeRole, lang } = useRent();
  const { data: readings = [], isLoading: lReadings } = useReadings();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const { data: properties = [], isLoading: lProperties } = useProperties();
  const readingMut = useReadingMutations();
  const logAction = useLogAction();

  const isLoading = lReadings || lRooms || lProperties;

  if (isLoading) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <MeterReadings
        readings={readings}
        rooms={rooms}
        properties={properties}
        activeRole={activeRole}
        lang={lang}
        onAddReading={(reading) => readingMut.create.mutate(reading)}
        onUpdateReading={(id, patch) => readingMut.update.mutate({ id, patch })}
        logAction={logAction}
      />
    </PageTransition>
  );
}
