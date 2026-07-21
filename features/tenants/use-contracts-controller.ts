'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Contract, Room, Property, Tenant, AppLanguage } from '@/lib/types';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';
import { getRoomName } from './tenants.helpers';

type ContractStatus = 'active' | 'suspended' | 'expired';

interface Args {
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  tenants: Tenant[];
  canModify: boolean;
  lang: AppLanguage;
  onUpdateContractStatus: (contractId: string, status: ContractStatus) => void;
  onDeleteContract: (contractId: string) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** Owns the Contracts tab: status/property filters and the status-update /
 *  terminate actions. Contract creation lives on the tenant detail page
 *  (see use-tenant-detail-controller). */
export function useContractsController({
  contracts,
  rooms,
  properties,
  canModify,
  lang,
  onUpdateContractStatus,
  onDeleteContract,
  logAction,
}: Args) {
  const tCommon = useTranslations('Common');
  const confirm = useConfirm();

  const [contractStatusFilter, setContractStatusFilter] = useState<'all' | ContractStatus>('all');
  const [contractPropertyFilter, setContractPropertyFilter] = useState('all');

  const filteredContracts = useMemo(
    () =>
      contracts.filter((contract) => {
        const statusMatch = contractStatusFilter === 'all' || contract.status === contractStatusFilter;
        if (!statusMatch) return false;
        if (contractPropertyFilter === 'all') return true;
        const room = rooms.find((r) => r.id === contract.roomId);
        return room?.propertyId === contractPropertyFilter;
      }),
    [contracts, rooms, contractStatusFilter, contractPropertyFilter]
  );

  function handleUpdateStatus(conId: string, status: ContractStatus) {
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    onUpdateContractStatus(conId, status);
    const contract = contracts.find((c) => c.id === conId);
    const rName = getRoomName(rooms, properties, contract?.roomId || '', lang);
    logAction(
      'Updated Contract Status',
      'បានធ្វើបច្ចុប្បន្នភាពកិច្ចសន្យា',
      `Updated contract status to "${status.toUpperCase()}" for ${rName}`,
      `បានផ្លាស់ប្តូរស្ថានភាពកិច្ចសន្យាទៅជា "${status.toUpperCase()}" សម្រាប់បន្ទប់ ${rName}`
    );
  }

  async function handleDeleteContractClick(conId: string) {
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    const ok = await confirm({
      title: tCommon('confirm_delete'),
      confirmLabel: tCommon('delete'),
      variant: 'destructive',
    });
    if (ok) {
      onDeleteContract(conId);
      logAction(
        'Terminated/Deleted Contract',
        'បានលុបកិច្ចសន្យា',
        `Deleted contract record ID ${conId}`,
        `បានលុបចោលកំណត់ត្រាកិច្ចសន្យាភាសាអង់គ្លេស/ខ្មែរ លេខសម្គាល់ ${conId}`
      );
    }
  }

  return {
    contractStatusFilter,
    setContractStatusFilter,
    contractPropertyFilter,
    setContractPropertyFilter,
    filteredContracts,
    handleUpdateStatus,
    handleDeleteContractClick,
  };
}
