'use client';

import MeterReadings from '@/features/meter-readings';
import { PageTransition } from '@/components/layout/PageTransition';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useReadings, useReadingMutations } from '@/features/meter-readings/readings.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function UtilitiesPage() {
  const { activeRole, lang, t } = useRent();
  const { data: readings = [] } = useReadings();
  const { data: rooms = [] } = useRooms();
  const { data: properties = [] } = useProperties();
  const readingMut = useReadingMutations();
  const logAction = useLogAction();

  return (
    <PageTransition>
      <MeterReadings
        readings={readings}
        rooms={rooms}
        properties={properties}
        activeRole={activeRole}
        lang={lang}
        t={t}
        onAddReading={(reading) => readingMut.create.mutate(reading)}
        logAction={logAction}
      />
    </PageTransition>
  );
}
