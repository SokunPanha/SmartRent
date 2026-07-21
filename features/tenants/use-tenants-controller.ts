'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Tenant, Contract } from '@/lib/types';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';

/** Today as an ISO date (YYYY-MM-DD), used as the default for date inputs. */
function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

interface Args {
  tenants: Tenant[];
  contracts: Contract[];
  canModify: boolean;
  onAddTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenantId: string) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** Owns the tenants tab: search/filter, and the add/delete-tenant flows.
 *  Contract concerns live in use-contracts-controller (Contracts tab) and
 *  use-tenant-detail-controller (per-tenant detail page). */
export function useTenantsController({
  tenants,
  contracts,
  canModify,
  onAddTenant,
  onDeleteTenant,
  logAction,
}: Args) {
  const t = useTranslations('Tenants');
  const tCommon = useTranslations('Common');
  const confirm = useConfirm();

  const [tenantSearch, setTenantSearch] = useState('');

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

  const [showTenantModal, setShowTenantModal] = useState(false);

  const [tenantName, setTenantName] = useState('');
  const [tenantNameKh, setTenantNameKh] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantNID, setTenantNID] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantCheckIn, setTenantCheckIn] = useState(todayISO);
  const [tenantEmergency, setTenantEmergency] = useState('');
  const [tenantTelegramAutoSend, setTenantTelegramAutoSend] = useState(true);

  const openTenantModal = () => setShowTenantModal(true);
  const closeTenantModal = () => setShowTenantModal(false);

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
    setTenantCheckIn(todayISO());
    setTenantEmergency('');
    setTenantTelegramAutoSend(true);
    setShowTenantModal(false);
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
    tenantSearch,
    setTenantSearch,
    filteredTenants,
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
    handleDeleteTenantClick,
  };
}
