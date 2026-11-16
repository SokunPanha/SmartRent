'use client';

import { useTranslations } from 'next-intl';
import { Tenant, Contract, Room, Property, UserRole, AppLanguage } from '@/lib/types';
import { PermissionBanner } from '@/components/shared/PermissionBanner';
import { useCan } from '@/features/admin/permissions.queries';
import { useContractsController } from './use-contracts-controller';
import { ContractTable } from './components/ContractTable';

interface ContractsViewProps {
  tenants: Tenant[];
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  activeRole: UserRole;
  lang: AppLanguage;
  onUpdateContractStatus: (contractId: string, status: 'active' | 'suspended' | 'expired') => void;
  onDeleteContract: (contractId: string) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** /contracts — every lease, filterable by status and building. New
 *  contracts are still created from a tenant's detail page. */
export default function ContractsView({
  tenants,
  contracts,
  rooms,
  properties,
  activeRole,
  lang,
  onUpdateContractStatus,
  onDeleteContract,
  logAction,
}: ContractsViewProps) {
  const t = useTranslations('Tenants');
  const can = useCan();
  const canModify = can('tenants.manage');

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
    <div className="space-y-6" id="contracts-container">
      {!canModify && (
        <PermissionBanner message={t('permission_banner_message', { role: activeRole.toUpperCase() })} />
      )}

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
    </div>
  );
}
