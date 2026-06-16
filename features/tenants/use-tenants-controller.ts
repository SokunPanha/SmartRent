'use client';

import { useState } from 'react';
import { Tenant, Contract, Room, Property, AppLanguage } from '@/lib/types';
import { getRoomName, getTenantName } from './tenants.helpers';

type ContractStatus = 'active' | 'suspended' | 'expired';

interface Args {
  tenants: Tenant[];
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  canModify: boolean;
  lang: AppLanguage;
  t: any;
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
  t,
  onAddTenant,
  onAddContract,
  onUpdateContractStatus,
  onDeleteTenant,
  onDeleteContract,
  logAction,
}: Args) {
  const vacantRooms = rooms.filter((r) => r.status === 'vacant');

  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  const [tenantName, setTenantName] = useState('');
  const [tenantNameKh, setTenantNameKh] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantNID, setTenantNID] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantCheckIn, setTenantCheckIn] = useState('2026-06-15');
  const [tenantEmergency, setTenantEmergency] = useState('');
  const [tenantTelegramChatId, setTenantTelegramChatId] = useState('');
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
    }
    setShowContractModal(true);
  }
  const closeContractModal = () => setShowContractModal(false);

  function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!canModify) return alert(t.insufficient_permissions);
    if (!tenantName || !tenantNameKh || !tenantPhone || !tenantNID) return alert(t.please_fill);

    onAddTenant({
      id: 'tenant-' + Date.now(),
      name: tenantName,
      nameKh: tenantNameKh,
      phone: tenantPhone,
      nationalId: tenantNID,
      email: tenantEmail || undefined,
      checkInDate: tenantCheckIn,
      emergencyContact: tenantEmergency,
      telegramChatId: tenantTelegramChatId || undefined,
      telegramAutoSend: tenantTelegramAutoSend,
    });
    logAction(
      'Registered Tenant',
      'បានចុះឈ្មោះអ្នកជួលថ្មី',
      `Registered tenant "${tenantName}" ${tenantTelegramChatId ? `(Telegram Chat ID: ${tenantTelegramChatId})` : ''}`,
      `បានចុះឈ្មោះប័ណ្ណស្នាក់នៅរបស់អតិថិជនឈ្មោះ "${tenantNameKh}" ${tenantTelegramChatId ? `(លេខសម្គាល់ Telegram: ${tenantTelegramChatId})` : ''}`
    );

    setTenantName('');
    setTenantNameKh('');
    setTenantPhone('');
    setTenantNID('');
    setTenantEmail('');
    setTenantCheckIn('2026-06-15');
    setTenantEmergency('');
    setTenantTelegramChatId('');
    setTenantTelegramAutoSend(true);
    setShowTenantModal(false);
  }

  function handleRoomSelectInContract(roomId: string) {
    setConRoomId(roomId);
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setConRent(room.rentAmount);
      setConDeposit(room.rentAmount * 2);
    }
  }

  function handleCreateContract(e: React.FormEvent) {
    e.preventDefault();
    if (!canModify) return alert(t.insufficient_permissions);
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
      return alert(t.please_fill);
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
    if (!canModify) return alert(t.insufficient_permissions);
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

  function handleDeleteContractClick(conId: string) {
    if (!canModify) return alert(t.insufficient_permissions);
    if (confirm(t.confirm_delete)) {
      onDeleteContract(conId);
      logAction(
        'Terminated/Deleted Contract',
        'បានលុបកិច្ចសន្យា',
        `Deleted contract record ID ${conId}`,
        `បានលុបចោលកំណត់ត្រាកិច្ចសន្យាភាសាអង់គ្លេស/ខ្មែរ លេខសម្គាល់ ${conId}`
      );
    }
  }

  function handleDeleteTenantClick(tenantId: string, name: string) {
    if (!canModify) return alert(t.insufficient_permissions);
    const hasActive = contracts.some((c) => c.tenantId === tenantId && c.status === 'active');
    if (hasActive) {
      return alert(
        lang === 'en'
          ? 'Cannot delete! This tenant currently holds an active rental contract.'
          : 'មិនអាចលុបបានទេ! អ្នកជួលនេះបច្ចុប្បន្នកំពុងមានកិច្ចសន្យាជួលដ៏សកម្មមួយ។'
      );
    }
    if (confirm(t.confirm_delete)) {
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
    tenantTelegramChatId,
    setTenantTelegramChatId,
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
