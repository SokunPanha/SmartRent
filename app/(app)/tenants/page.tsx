'use client';

import TenantsContracts from '@/features/tenants';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import {
  useTenants,
  useContracts,
  useTenantMutations,
  useContractMutations,
} from '@/features/tenants/tenants.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function TenantsPage() {
  const { activeRole, lang } = useRent();
  const { data: tenants = [], isLoading: lTenants } = useTenants();
  const { data: contracts = [], isLoading: lContracts } = useContracts();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const { data: properties = [], isLoading: lProperties } = useProperties();
  const tenantMut = useTenantMutations();
  const contractMut = useContractMutations();
  const logAction = useLogAction();

  const isLoading = lTenants || lContracts || lRooms || lProperties;

  if (isLoading) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <TenantsContracts
        tenants={tenants}
        contracts={contracts}
        rooms={rooms}
        properties={properties}
        activeRole={activeRole}
        lang={lang}
        onAddTenant={(tenant) => tenantMut.create.mutate(tenant)}
        onUpdateContractStatus={(id, status) => contractMut.updateStatus.mutate({ id, status })}
        onDeleteTenant={(id) => tenantMut.remove.mutate(id)}
        onDeleteContract={(id) => contractMut.remove.mutate(id)}
        logAction={logAction}
      />
    </PageTransition>
  );
}
