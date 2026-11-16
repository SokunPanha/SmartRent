'use client';

import ContractsView from '@/features/tenants/ContractsView';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useTenants, useContracts, useContractMutations } from '@/features/tenants/tenants.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function ContractsPage() {
  const { activeRole, lang } = useRent();
  const { data: tenants = [], isLoading: lTenants } = useTenants();
  const { data: contracts = [], isLoading: lContracts } = useContracts();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const { data: properties = [], isLoading: lProperties } = useProperties();
  const contractMut = useContractMutations();
  const logAction = useLogAction();

  if (lTenants || lContracts || lRooms || lProperties) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <ContractsView
        tenants={tenants}
        contracts={contracts}
        rooms={rooms}
        properties={properties}
        activeRole={activeRole}
        lang={lang}
        onUpdateContractStatus={(id, status) => contractMut.updateStatus.mutate({ id, status })}
        onDeleteContract={(id) => contractMut.remove.mutate(id)}
        logAction={logAction}
      />
    </PageTransition>
  );
}
