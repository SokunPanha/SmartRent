'use client';

import { Tenant, Contract, Room, Property, UserRole, AppLanguage } from '@/lib/types';
import { PermissionBanner } from '@/components/shared/PermissionBanner';
import { useCan } from '@/features/admin/permissions.queries';
import { useTenantsController } from './use-tenants-controller';
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
  t: any;
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
  t,
  onAddTenant,
  onAddContract,
  onUpdateContractStatus,
  onDeleteTenant,
  onDeleteContract,
  logAction,
}: TenantsContractsProps) {
  const can = useCan();
  const canModify = can('tenants.manage');

  const c = useTenantsController({
    tenants,
    contracts,
    rooms,
    properties,
    canModify,
    lang,
    t,
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
        <PermissionBanner
          lang={lang}
          message={
            lang === 'en'
              ? `${activeRole.toUpperCase()} persona cannot execute contracts or enroll tenants. Switch roles to modify records.`
              : `តួនាទីជាប្រព័ន្ធ ${activeRole.toUpperCase()} មិនអនុញ្ញាតឱ្យកែប្រែកិច្ចសន្យាឡើយ។ សូមផ្លាស់ប្តូរទៅកាន់ Owner ឬ Manager។`
          }
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <TenantList
          tenants={tenants}
          canModify={canModify}
          onAdd={c.openTenantModal}
          onDelete={c.handleDeleteTenantClick}
          t={t}
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
          t={t}
          lang={lang}
        />
      </div>

      <TenantModal c={c} t={t} lang={lang} />
      <ContractModal c={c} tenants={tenants} rooms={rooms} properties={properties} t={t} lang={lang} />
    </div>
  );
}
