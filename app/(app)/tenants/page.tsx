'use client';

import TenantsView from '@/features/tenants';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useTenants, useContracts, useTenantMutations } from '@/features/tenants/tenants.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function TenantsPage() {
  const { activeRole, lang } = useRent();
  const { data: tenants = [], isLoading: lTenants } = useTenants();
  const { data: contracts = [], isLoading: lContracts } = useContracts();
  const tenantMut = useTenantMutations();
  const logAction = useLogAction();

  const isLoading = lTenants || lContracts;

  if (isLoading) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <TenantsView
        tenants={tenants}
        contracts={contracts}
        activeRole={activeRole}
        lang={lang}
        onAddTenant={(tenant) => tenantMut.create.mutate(tenant)}
        onDeleteTenant={(id) => tenantMut.remove.mutate(id)}
        logAction={logAction}
      />
    </PageTransition>
  );
}
