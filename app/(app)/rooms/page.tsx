'use client';

import AllRoomsView from '@/features/properties/AllRoomsView';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useTenants, useContracts } from '@/features/tenants/tenants.queries';

export default function AllRoomsPage() {
  const { lang } = useRent();
  const { data: properties = [], isLoading: lProperties } = useProperties();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const { data: contracts = [], isLoading: lContracts } = useContracts();
  const { data: tenants = [], isLoading: lTenants } = useTenants();

  if (lProperties || lRooms || lContracts || lTenants) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AllRoomsView
        properties={properties}
        rooms={rooms}
        contracts={contracts}
        tenants={tenants}
        lang={lang}
      />
    </PageTransition>
  );
}
