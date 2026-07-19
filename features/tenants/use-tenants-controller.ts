'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Tenant, Contract, Room, Property, AppLanguage } from '@/lib/types';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';
import { useSettings } from '@/features/settings/settings.queries';
import { getRoomName, getTenantName } from './tenants.helpers';

type ContractStatus = 'active' | 'suspended' | 'expired';

interface Args {
  tenants: Tenant[];
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  canModify: boolean;
  lang: AppLanguage;
  onAddTenant: (tenant: Tenant) => void;
  onAddContract: (contract: Contract) => void;
  onUpdateContractStatus: (contractId: string, status: ContractStatus) => void;
  onDeleteTenant: (tenantId: string) => void;
  onDeleteContract: (contractId: string) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** Owns modal + form state and all CRUD handlers for tenants & contracts. */
export function useTenantsController({
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
}: Args) {
  const t = useTranslations('Tenants');
  const tCommon = useTranslations('Common');
  const confirm = useConfirm();
  const { data: settings } = useSettings();
  const vacantRooms = rooms.filter((r) => r.status === 'vacant');

  // A room's property may override the electricity/water rate for its zone;
  // otherwise fall back to the system-wide default from Settings.
  function resolveRatesForRoom(roomId: string): { elec: number; water: number } {
    const room = rooms.find((r) => r.id === roomId);
    const property = properties.find((p) => p.id === room?.propertyId);
    return {
      elec: property?.electricityRate ?? settings?.defaultElectricityRate ?? 1000,
      water: property?.waterRate ?? settings?.defaultWaterRate ?? 2000,
    };
  }

  const [tenantSearch, setTenantSearch] = useState('');
  const [contractStatusFilter, setContractStatusFilter] = useState<'all' | ContractStatus>('all');
  const [contractPropertyFilter, setContractPropertyFilter] = useState('all');

  const filteredTenants = useMemo(() => {
    const query = tenantSearch.trim().toLowerCase();
    if (!query) return tenants;
    return tenants.filter(
      (tenant) =>
        tenant.name.toLowerCase().includes(query) ||
        tenant.nameKh.toLowerCase().includes(query) ||
        tenant.phone.toLowerCase().includes(query)
    );
  }, [tenants, tenantSearch]);

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

  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  const [tenantName, setTenantName] = useState('');
  const [tenantNameKh, setTenantNameKh] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantNID, setTenantNID] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantCheckIn, setTenantCheckIn] = useState('2026-06-15');
  const [tenantEmergency, setTenantEmergency] = useState('');
  const [tenantTelegramAutoSend, setTenantTelegramAutoSend] = useState(true);

  const [conRoomId, setConRoomId] = useState('');
  const [conTenantId, setConTenantId] = useState('');
  const [conStartDate, setConStartDate] = useState('2026-06-15');
  const [conEndDate, setConEndDate] = useState('2027-06-15');
  const [conRent, setConRent] = useState<number>(200);
  const [conDeposit, setConDeposit] = useState<number>(400);
  const [conElecRate, setConElecRate] = useState<number>(1000);
  const [conWaterRate, setConWaterRate] = useState<number>(2000);

  const openTenantModal = () => setShowTenantModal(true);
  const closeTenantModal = () => setShowTenantModal(false);

  function openContractModal() {
    setConRoomId(vacantRooms[0]?.id || '');
    setConTenantId(tenants[0]?.id || '');
    if (vacantRooms[0]) {
      setConRent(vacantRooms[0].rentAmount);
      setConDeposit(vacantRooms[0].rentAmount * 2);
      const rates = resolveRatesForRoom(vacantRooms[0].id);
      setConElecRate(rates.elec);
      setConWaterRate(rates.water);
    }
    setShowContractModal(true);
  }
  const closeContractModal = () => setShowContractModal(false);

  function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    if (!tenantName || !tenantNameKh || !tenantPhone || !tenantNID) return toast.error(tCommon('please_fill'));

    onAddTenant({
      id: 'tenant-' + Date.now(),
      name: tenantName,
      nameKh: tenantNameKh,
      phone: tenantPhone,
      nationalId: tenantNID,
      email: tenantEmail || undefined,
      checkInDate: tenantCheckIn,
      emergencyContact: tenantEmergency,
      telegramAutoSend: tenantTelegramAutoSend,
    });
    logAction(
      'Registered Tenant',
      'បានចុះឈ្មោះអ្នកជួលថ្មី',
      `Registered tenant "${tenantName}"`,
      `បានចុះឈ្មោះប័ណ្ណស្នាក់នៅរបស់អតិថិជនឈ្មោះ "${tenantNameKh}"`
    );

    setTenantName('');
    setTenantNameKh('');
    setTenantPhone('');
    setTenantNID('');
    setTenantEmail('');
    setTenantCheckIn('2026-06-15');
    setTenantEmergency('');
    setTenantTelegramAutoSend(true);
    setShowTenantModal(false);
  }

  function handleRoomSelectInContract(roomId: string) {
    setConRoomId(roomId);
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setConRent(room.rentAmount);
      setConDeposit(room.rentAmount * 2);
      const rates = resolveRatesForRoom(roomId);
      setConElecRate(rates.elec);
      setConWaterRate(rates.water);
    }
  }

  function handleCreateContract(e: React.FormEvent) {
    e.preventDefault();
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    if (
      !conRoomId ||
      !conTenantId ||
      !conStartDate ||
      !conEndDate ||
      !conRent ||
      !conDeposit ||
      !conElecRate ||
      !conWaterRate
    ) {
      return toast.error(tCommon('please_fill'));
    }

    onAddContract({
      id: 'cn-' + Date.now(),
      roomId: conRoomId,
      tenantId: conTenantId,
      startDate: conStartDate,
      endDate: conEndDate,
      rentAmount: Number(conRent),
      depositAmount: Number(conDeposit),
      electricityRate: Number(conElecRate),
      waterRate: Number(conWaterRate),
      status: 'active',
    });

    const room = rooms.find((r) => r.id === conRoomId);
    const tenantNameString = getTenantName(tenants, conTenantId, lang);
    logAction(
      'Issued Contract',
      'បានបង្កើតកិច្ចសន្យាថ្មី',
      `Issued contract for Room ${room?.roomNumber} with rent $${conRent} to ${tenantNameString}`,
      `បានបង្កើតកិច្ចសន្យាជួលបន្ទប់លេខ ${room?.roomNumber} ថ្លៃជួល $${conRent} ជាមួយឈ្មោះ ${tenantNameString}`
    );

    setConRoomId('');
    setConTenantId('');
    setConStartDate('2026-06-15');
    setConEndDate('2027-06-15');
    setShowContractModal(false);
  }

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

  async function handleDeleteTenantClick(tenantId: string, name: string) {
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    const hasActive = contracts.some((c) => c.tenantId === tenantId && c.status === 'active');
    if (hasActive) {
      return toast.error(t('cannot_delete_active_contract'));
    }
    const ok = await confirm({
      title: tCommon('confirm_delete'),
      confirmLabel: tCommon('delete'),
      variant: 'destructive',
    });
    if (ok) {
      onDeleteTenant(tenantId);
      logAction(
        'Removed Tenant',
        'បានលុបផ្ដាច់ព័ត៌មានអ្នកជួល',
        `Deleted tenant record for ${name}`,
        `បានលុបចោលទម្រង់អ្នកជួលឈ្មោះ ${name} រួចហើយ`
      );
    }
  }

  return {
    vacantRooms,
    tenantSearch,
    setTenantSearch,
    filteredTenants,
    contractStatusFilter,
    setContractStatusFilter,
    contractPropertyFilter,
    setContractPropertyFilter,
    filteredContracts,
    showTenantModal,
    openTenantModal,
    closeTenantModal,
    tenantName,
    setTenantName,
    tenantNameKh,
    setTenantNameKh,
    tenantPhone,
    setTenantPhone,
    tenantNID,
    setTenantNID,
    tenantEmail,
    setTenantEmail,
    tenantCheckIn,
    setTenantCheckIn,
    tenantEmergency,
    setTenantEmergency,
    tenantTelegramAutoSend,
    setTenantTelegramAutoSend,
    handleCreateTenant,
    showContractModal,
    openContractModal,
    closeContractModal,
    conRoomId,
    conTenantId,
    setConTenantId,
    conStartDate,
    setConStartDate,
    conEndDate,
    setConEndDate,
    conRent,
    setConRent,
    conDeposit,
    setConDeposit,
    conElecRate,
    setConElecRate,
    conWaterRate,
    setConWaterRate,
    handleRoomSelectInContract,
    handleCreateContract,
    handleUpdateStatus,
    handleDeleteContractClick,
    handleDeleteTenantClick,
  };
}
