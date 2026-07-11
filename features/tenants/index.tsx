'use client';

import { useTranslations } from 'next-intl';
import { Tenant, Contract, Room, Property, UserRole, AppLanguage } from '@/lib/types';
import { PermissionBanner } from '@/components/shared/PermissionBanner';
import { useCan } from '@/features/admin/permissions.queries';
import { useTenantsController } from './use-tenants-controller';
import { useTenantMutations } from './tenants.queries';
import { TenantList } from './components/TenantList';
import { ContractList } from './components/ContractList';
import { TenantModal } from './components/TenantModal';
import { ContractModal } from './components/ContractModal';

interface TenantsContractsProps {
  tenants: Tenant[];
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  activeRole: UserRole;
  lang: AppLanguage;
  onAddTenant: (tenant: Tenant) => void;
  onAddContract: (contract: Contract) => void;
  onUpdateContractStatus: (contractId: string, status: 'active' | 'suspended' | 'expired') => void;
  onDeleteTenant: (tenantId: string) => void;
  onDeleteContract: (contractId: string) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

export default function TenantsContracts({
  tenants,
  contracts,
  rooms,
  properties,
  activeRole,
  lang,
  onAddTenant,
  onAddContract,
  onUpdateContractStatus,
  onDeleteTenant,
  onDeleteContract,
  logAction,
}: TenantsContractsProps) {
  const t = useTranslations('Tenants');
  const can = useCan();
  const canModify = can('tenants.manage');
  const { generateTelegramCode } = useTenantMutations();

  const c = useTenantsController({
    tenants,
    contracts,
    rooms,
    properties,
    canModify,
    lang,
    onAddTenant,
    onAddContract,
    onUpdateContractStatus,
    onDeleteTenant,
    onDeleteContract,
    logAction,
  });

  return (
    <div className="space-y-6" id="tenants-contracts-container">
      {!canModify && (
        <PermissionBanner message={t('permission_banner_message', { role: activeRole.toUpperCase() })} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <TenantList
          tenants={tenants}
          canModify={canModify}
          onAdd={c.openTenantModal}
          onDelete={c.handleDeleteTenantClick}
          onGenerateTelegramCode={(tenantId) => generateTelegramCode.mutateAsync(tenantId)}
          lang={lang}
        />
        <ContractList
          contracts={contracts}
          rooms={rooms}
          properties={properties}
          tenants={tenants}
          vacantRooms={c.vacantRooms}
          canModify={canModify}
          onAdd={c.openContractModal}
          onUpdateStatus={c.handleUpdateStatus}
          onDelete={c.handleDeleteContractClick}
          lang={lang}
        />
      </div>

      <TenantModal c={c} lang={lang} />
      <ContractModal c={c} tenants={tenants} rooms={rooms} properties={properties} lang={lang} />
    </div>
  );
}
