'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, UserRound } from 'lucide-react';
import TenantDetail from '@/features/tenants/TenantDetail';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import {
  useTenants,
  useContracts,
  useTenantMutations,
  useContractMutations,
} from '@/features/tenants/tenants.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function TenantDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const t = useTranslations('Tenants');
  const { activeRole, lang } = useRent();

  const { data: tenants = [], isLoading: lTenants } = useTenants();
  const { data: contracts = [], isLoading: lContracts } = useContracts();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const { data: properties = [], isLoading: lProperties } = useProperties();
  const tenantMut = useTenantMutations();
  const contractMut = useContractMutations();
  const logAction = useLogAction();

  if (lTenants || lContracts || lRooms || lProperties) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  const tenant = tenants.find((tn) => tn.id === id);

  if (!tenant) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Link
            href="/tenants"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_tenants')}
          </Link>
          <EmptyState icon={UserRound} title={t('tenant_not_found')} className="p-12 shadow-xs" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <TenantDetail
        tenant={tenant}
        contracts={contracts}
        rooms={rooms}
        properties={properties}
        activeRole={activeRole}
        lang={lang}
        onAddContract={(contract) => contractMut.create.mutate(contract)}
        onDeleteTenant={(id) => tenantMut.remove.mutate(id)}
        onUpdateTenant={(patch) => tenantMut.update.mutateAsync(patch)}
        generateTelegramCode={(tenantId) => tenantMut.generateTelegramCode.mutateAsync(tenantId)}
        logAction={logAction}
      />
    </PageTransition>
  );
}
