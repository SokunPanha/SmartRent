'use client';

import PropertiesRooms from '@/features/properties';
import { PageTransition } from '@/components/layout/PageTransition';
import { useRent } from '@/store/rent-store';
import {
  useProperties,
  useRooms,
  usePropertyMutations,
  useRoomMutations,
} from '@/features/properties/properties.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function PropertiesPage() {
  const { activeRole, lang } = useRent();
  const { data: properties = [] } = useProperties();
  const { data: rooms = [] } = useRooms();
  const propertyMut = usePropertyMutations();
  const roomMut = useRoomMutations();
  const logAction = useLogAction();

  return (
    <PageTransition>
      <PropertiesRooms
        properties={properties}
        rooms={rooms}
        activeRole={activeRole}
        lang={lang}
        onAddProperty={(prop) => propertyMut.create.mutate(prop)}
        onAddRoom={(room) => roomMut.create.mutate(room)}
        onUpdateRoom={(room) => roomMut.update.mutate(room)}
        onDeleteRoom={(id) => roomMut.remove.mutate(id)}
        onDeleteProperty={(id) => propertyMut.remove.mutate(id)}
        logAction={logAction}
      />
    </PageTransition>
  );
}
