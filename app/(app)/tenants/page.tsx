'use client';

import TenantsContracts from '@/features/tenants';
import { PageTransition } from '@/components/layout/PageTransition';
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
  const { data: tenants = [] } = useTenants();
  const { data: contracts = [] } = useContracts();
  const { data: rooms = [] } = useRooms();
  const { data: properties = [] } = useProperties();
  const tenantMut = useTenantMutations();
  const contractMut = useContractMutations();
  const logAction = useLogAction();

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
        onAddContract={(contract) => contractMut.create.mutate(contract)}
        onUpdateContractStatus={(id, status) => contractMut.updateStatus.mutate({ id, status })}
        onDeleteTenant={(id) => tenantMut.remove.mutate(id)}
        onDeleteContract={(id) => contractMut.remove.mutate(id)}
        logAction={logAction}
      />
    </PageTransition>
  );
}
