'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Tenant, Contract, Room, Property, AppLanguage } from '@/lib/types';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';
import { useSettings } from '@/features/settings/settings.queries';
import { TelegramConnectCode } from './tenants.api';
import { useTenantMessages, useSendTenantMessage } from './tenants.queries';
import { getTenantName } from './tenants.helpers';

type ContractStatus = 'active' | 'suspended' | 'expired';

/** Today as an ISO date (YYYY-MM-DD), used as the default for date inputs. */
function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** One year from today (ISO) — the default contract term end date. */
function oneYearFromTodayISO(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

interface Args {
  tenant: Tenant;
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  canModify: boolean;
  lang: AppLanguage;
  onAddContract: (contract: Contract) => void;
  onDeleteTenant: (tenantId: string) => void;
  generateTelegramCode: (tenantId: string) => Promise<TelegramConnectCode>;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
  /** Called after the tenant itself is deleted, so the page can navigate away. */
  onTenantDeleted: () => void;
}

/** Owns everything on a single tenant's detail page: contract history + the
 *  "add contract" modal (tenant pre-locked), Telegram connect, the message
 *  thread, and deleting the tenant. */
export function useTenantDetailController({
  tenant,
  contracts,
  rooms,
  properties,
  canModify,
  lang,
  onAddContract,
  onDeleteTenant,
  generateTelegramCode,
  logAction,
  onTenantDeleted,
}: Args) {
  const t = useTranslations('Tenants');
  const tCommon = useTranslations('Common');
  const confirm = useConfirm();
  const { data: settings } = useSettings();

  const tenantContracts = useMemo(
    () => contracts.filter((c) => c.tenantId === tenant.id),
    [contracts, tenant.id]
  );
  const vacantRooms = useMemo(() => rooms.filter((r) => r.status === 'vacant'), [rooms]);

  function resolveRatesForRoom(roomId: string): { elec: number; water: number } {
    const room = rooms.find((r) => r.id === roomId);
    const property = properties.find((p) => p.id === room?.propertyId);
    return {
      elec: property?.electricityRate ?? settings?.defaultElectricityRate ?? 1000,
      water: property?.waterRate ?? settings?.defaultWaterRate ?? 2000,
    };
  }

  // Add-contract modal (tenant is fixed to this page's tenant)
  const [showContractModal, setShowContractModal] = useState(false);
  const [conRoomId, setConRoomId] = useState('');
  const [conStartDate, setConStartDate] = useState(todayISO);
  const [conEndDate, setConEndDate] = useState(oneYearFromTodayISO);
  const [conRent, setConRent] = useState<number>(200);
  const [conDeposit, setConDeposit] = useState<number>(400);
  const [conElecRate, setConElecRate] = useState<number>(1000);
  const [conWaterRate, setConWaterRate] = useState<number>(2000);

  function openContractModal() {
    setConRoomId(vacantRooms[0]?.id || '');
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
    if (!conRoomId || !conStartDate || !conEndDate || !conRent || !conDeposit || !conElecRate || !conWaterRate) {
      return toast.error(tCommon('please_fill'));
    }

    onAddContract({
      id: 'cn-' + Date.now(),
      roomId: conRoomId,
      tenantId: tenant.id,
      startDate: conStartDate,
      endDate: conEndDate,
      rentAmount: Number(conRent),
      depositAmount: Number(conDeposit),
      electricityRate: Number(conElecRate),
      waterRate: Number(conWaterRate),
      status: 'active',
    });

    const room = rooms.find((r) => r.id === conRoomId);
    const tenantNameString = getTenantName([tenant], tenant.id, lang);
    logAction(
      'Issued Contract',
      'បានបង្កើតកិច្ចសន្យាថ្មី',
      `Issued contract for Room ${room?.roomNumber} with rent $${conRent} to ${tenantNameString}`,
      `បានបង្កើតកិច្ចសន្យាជួលបន្ទប់លេខ ${room?.roomNumber} ថ្លៃជួល $${conRent} ជាមួយឈ្មោះ ${tenantNameString}`
    );

    setConRoomId('');
    setConStartDate(todayISO());
    setConEndDate(oneYearFromTodayISO());
    setShowContractModal(false);
  }

  // Telegram connect
  const [connectResult, setConnectResult] = useState<TelegramConnectCode | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerateCode() {
    setShowConnectModal(true);
    setConnectResult(null);
    setCopied(false);
    setConnectLoading(true);
    try {
      const result = await generateTelegramCode(tenant.id);
      setConnectResult(result);
    } finally {
      setConnectLoading(false);
    }
  }
  const closeConnectModal = () => setShowConnectModal(false);

  function handleCopyLink() {
    if (!connectResult?.deepLink) return;
    navigator.clipboard.writeText(connectResult.deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Message thread
  const [showMessages, setShowMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const messagesQuery = useTenantMessages(showMessages ? tenant.id : null);
  const sendMessage = useSendTenantMessage(tenant.id);

  const openMessages = () => setShowMessages(true);
  const closeMessages = () => setShowMessages(false);

  function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage.mutate(draft.trim(), { onSuccess: () => setDraft('') });
  }

  async function handleDeleteTenant() {
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    const hasActive = tenantContracts.some((c) => c.status === 'active');
    if (hasActive) {
      return toast.error(t('cannot_delete_active_contract'));
    }
    const ok = await confirm({
      title: tCommon('confirm_delete'),
      confirmLabel: tCommon('delete'),
      variant: 'destructive',
    });
    if (ok) {
      onDeleteTenant(tenant.id);
      logAction(
        'Removed Tenant',
        'បានលុបផ្ដាច់ព័ត៌មានអ្នកជួល',
        `Deleted tenant record for ${tenant.name}`,
        `បានលុបចោលទម្រង់អ្នកជួលឈ្មោះ ${tenant.name} រួចហើយ`
      );
      onTenantDeleted();
    }
  }

  return {
    tenantContracts,
    vacantRooms,
    showContractModal,
    openContractModal,
    closeContractModal,
    conRoomId,
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
    showConnectModal,
    closeConnectModal,
    connectResult,
    connectLoading,
    copied,
    handleGenerateCode,
    handleCopyLink,
    showMessages,
    openMessages,
    closeMessages,
    draft,
    setDraft,
    messagesQuery,
    sendMessage,
    handleSendReply,
    handleDeleteTenant,
  };
}
