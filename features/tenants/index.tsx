'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tenant, Contract, Room, Property, UserRole, AppLanguage } from '@/lib/types';
import { PermissionBanner } from '@/components/shared/PermissionBanner';
import { useCan } from '@/features/admin/permissions.queries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTenantsController } from './use-tenants-controller';
import { useContractsController } from './use-contracts-controller';
import { TenantTable } from './components/TenantTable';
import { ContractTable } from './components/ContractTable';
import { TenantModal } from './components/TenantModal';

interface TenantsContractsProps {
  tenants: Tenant[];
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  activeRole: UserRole;
  lang: AppLanguage;
  onAddTenant: (tenant: Tenant) => void;
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
  onUpdateContractStatus,
  onDeleteTenant,
  onDeleteContract,
  logAction,
}: TenantsContractsProps) {
  const t = useTranslations('Tenants');
  const can = useCan();
  const canModify = can('tenants.manage');
  const [tab, setTab] = useState<'tenants' | 'contracts'>('tenants');

  const c = useTenantsController({
    tenants,
    contracts,
    canModify,
    onAddTenant,
    onDeleteTenant,
    logAction,
  });

  const cc = useContractsController({
    contracts,
    rooms,
    properties,
    tenants,
    canModify,
    lang,
    onUpdateContractStatus,
    onDeleteContract,
    logAction,
  });

  return (
    <div className="space-y-6" id="tenants-contracts-container">
      {!canModify && (
        <PermissionBanner message={t('permission_banner_message', { role: activeRole.toUpperCase() })} />
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'tenants' | 'contracts')}>
        <TabsList>
          <TabsTrigger value="tenants">{t('tenant_list')}</TabsTrigger>
          <TabsTrigger value="contracts">{t('contracts_list')}</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants">
          <TenantTable
            tenants={c.filteredTenants}
            search={c.tenantSearch}
            onSearchChange={c.setTenantSearch}
            canModify={canModify}
            onAdd={c.openTenantModal}
            onDelete={c.handleDeleteTenantClick}
            lang={lang}
          />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractTable
            contracts={cc.filteredContracts}
            rooms={rooms}
            properties={properties}
            tenants={tenants}
            statusFilter={cc.contractStatusFilter}
            onStatusFilterChange={cc.setContractStatusFilter}
            propertyFilter={cc.contractPropertyFilter}
            onPropertyFilterChange={cc.setContractPropertyFilter}
            canModify={canModify}
            onUpdateStatus={cc.handleUpdateStatus}
            onDelete={cc.handleDeleteContractClick}
            lang={lang}
          />
        </TabsContent>
      </Tabs>

      <TenantModal c={c} lang={lang} />
    </div>
  );
}
