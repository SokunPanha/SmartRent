'use client';

import { useTranslations } from 'next-intl';
import { Tenant, Contract, UserRole, AppLanguage } from '@/lib/types';
import { PermissionBanner } from '@/components/shared/PermissionBanner';
import { useCan } from '@/features/admin/permissions.queries';
import { useTenantsController } from './use-tenants-controller';
import { TenantTable } from './components/TenantTable';
import { TenantModal } from './components/TenantModal';

interface TenantsViewProps {
  tenants: Tenant[];
  contracts: Contract[];
  activeRole: UserRole;
  lang: AppLanguage;
  onAddTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenantId: string) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** /tenants — the tenant register (search, add, delete). Contracts have their
 *  own page under the same sidebar group: see ./ContractsView. */
export default function TenantsView({
  tenants,
  contracts,
  activeRole,
  lang,
  onAddTenant,
  onDeleteTenant,
  logAction,
}: TenantsViewProps) {
  const t = useTranslations('Tenants');
  const can = useCan();
  const canModify = can('tenants.manage');

  const c = useTenantsController({
    tenants,
    contracts,
    canModify,
    onAddTenant,
    onDeleteTenant,
    logAction,
  });

  return (
    <div className="space-y-6" id="tenants-container">
      {!canModify && (
        <PermissionBanner message={t('permission_banner_message', { role: activeRole.toUpperCase() })} />
      )}

      <TenantTable
        tenants={c.filteredTenants}
        search={c.tenantSearch}
        onSearchChange={c.setTenantSearch}
        canModify={canModify}
        onAdd={c.openTenantModal}
        onDelete={c.handleDeleteTenantClick}
        lang={lang}
      />

      <TenantModal c={c} lang={lang} />
    </div>
  );
}
