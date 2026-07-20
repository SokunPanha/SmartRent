'use client';

import BuildingsView from '@/features/properties';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import {
  useProperties,
  useRooms,
  usePropertyMutations,
} from '@/features/properties/properties.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function PropertiesPage() {
  const { activeRole, lang } = useRent();
  const { data: properties = [], isLoading: lProperties } = useProperties();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const propertyMut = usePropertyMutations();
  const logAction = useLogAction();

  if (lProperties || lRooms) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <BuildingsView
        properties={properties}
        rooms={rooms}
        activeRole={activeRole}
        lang={lang}
        onAddProperty={(prop) => propertyMut.create.mutate(prop)}
        logAction={logAction}
      />
    </PageTransition>
  );
}
