'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Phone,
  UserSquare,
  Mail,
  AlertCircle,
  Send,
  Copy,
  Check,
  MessageCircle,
  FileText,
  Plus,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import { Tenant, Contract, Room, Property, UserRole, AppLanguage } from '@/lib/types';
import { PermissionBanner } from '@/components/shared/PermissionBanner';
import { StatusBadge, StatusBadgeTone } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { useCan } from '@/features/admin/permissions.queries';
import { pickLocale } from '@/lib/i18n';
import { getRoomName } from './tenants.helpers';
import { TelegramConnectCode } from './tenants.api';
import { useTenantDetailController } from './use-tenant-detail-controller';
import { ContractModal } from './components/ContractModal';

function contractStatusMeta(
  status: Contract['status'],
  t: (k: string) => string
): { tone: StatusBadgeTone; label: string } {
  if (status === 'suspended') return { tone: 'warning', label: t('suspended') };
  if (status === 'expired') return { tone: 'danger', label: t('expired') };
  return { tone: 'success', label: t('active') };
}

interface TenantDetailProps {
  tenant: Tenant;
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  activeRole: UserRole;
  lang: AppLanguage;
  onAddContract: (contract: Contract) => void;
  onDeleteTenant: (tenantId: string) => void;
  generateTelegramCode: (tenantId: string) => Promise<TelegramConnectCode>;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** Per-tenant page: profile header + Telegram/messages + contract history. */
export default function TenantDetail({
  tenant,
  contracts,
  rooms,
  properties,
  activeRole,
  lang,
  onAddContract,
  onDeleteTenant,
  generateTelegramCode,
  logAction,
}: TenantDetailProps) {
  const t = useTranslations('Tenants');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const can = useCan();
  const canModify = can('tenants.manage');
  const threadEndRef = useRef<HTMLDivElement>(null);

  const c = useTenantDetailController({
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
    onTenantDeleted: () => router.push('/tenants'),
  });

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [c.messagesQuery.data]);

  return (
    <div className="space-y-6" id="tenant-detail-container">
      <Link
        href="/tenants"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back_to_tenants')}
      </Link>

      {!canModify && (
        <PermissionBanner message={t('permission_banner_message', { role: activeRole.toUpperCase() })} />
      )}

      <div className="bg-card border border-border rounded-xl shadow-3xs p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-5">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight font-sans flex items-center gap-2">
            {pickLocale(lang, tenant.name, tenant.nameKh)}
            {lang === 'kh' && tenant.name !== tenant.nameKh && (
              <span className="text-sm text-muted-foreground font-normal">({tenant.name})</span>
            )}
          </h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-muted-foreground font-sans">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono">{tenant.phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono">{tenant.nationalId}</span>
            </div>
            {tenant.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="font-mono">{tenant.email}</span>
              </div>
            )}
            <div>
              {t('check_in')}: <span className="font-semibold text-foreground">{tenant.checkInDate}</span>
            </div>
          </div>
          {tenant.emergencyContact && (
            <div className="mt-3 p-2.5 bg-muted rounded-lg text-xs text-muted-foreground border border-border flex items-start gap-1.5 font-sans max-w-md">
              <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>{tenant.emergencyContact}</span>
            </div>
          )}
        </div>

        {canModify && (
          <button
            onClick={c.handleDeleteTenant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 rounded-lg transition cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('delete_tenant')}
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-3xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {tenant.telegramChatId ? (
          <div className="flex items-center gap-2">
            <StatusBadge tone="success">✈️ {t('connected')}</StatusBadge>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                tenant.telegramAutoSend
                  ? 'text-chart-2 bg-chart-2/10 border border-chart-2/20'
                  : 'text-muted-foreground bg-muted border border-border'
              }`}
            >
              {tenant.telegramAutoSend ? t('auto_send') : t('manual')}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <StatusBadge tone="info">{t('telegram_not_connected')}</StatusBadge>
            {canModify && (
              <button
                onClick={c.handleGenerateCode}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-info bg-info/10 border border-info/20 hover:bg-info/20 transition cursor-pointer"
              >
                <Send className="w-3 h-3" />
                {t('generate_code')}
              </button>
            )}
          </div>
        )}

        {tenant.telegramChatId && (
          <button
            onClick={c.openMessages}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-info bg-info/10 border border-info/20 hover:bg-info/20 transition cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {t('messages')}
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-3xs overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
          <h3 className="font-bold text-foreground text-base font-sans flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" />
            {t('tenant_contracts_heading')}
          </h3>
          {canModify && (
            <button
              onClick={c.openContractModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer shrink-0"
              id="open-add-contract-modal"
            >
              <Plus className="w-4 h-4" />
              {t('add_contract')}
            </button>
          )}
        </div>

        {c.tenantContracts.length === 0 ? (
          <EmptyState icon={FileText} title={t('no_contracts')} className="p-12 shadow-none border-0" />
        ) : (
          <div className="divide-y divide-border/60">
            {c.tenantContracts.map((contract) => {
              const s = contractStatusMeta(contract.status, t);
              return (
                <div key={contract.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                      <span className="font-bold text-foreground text-sm font-sans">
                        {getRoomName(rooms, properties, contract.roomId, lang)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {contract.startDate} {'→'} {contract.endDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-sans">
                    <div>
                      <span className="text-muted-foreground block">{t('monthly_rent')}</span>
                      <span className="font-bold text-foreground font-mono">${contract.rentAmount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">{t('deposit')}</span>
                      <span className="font-bold text-chart-2 font-mono">${contract.depositAmount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ContractModal c={c} tenant={tenant} rooms={rooms} properties={properties} lang={lang} />

      <Modal open={c.showConnectModal} onClose={c.closeConnectModal} size="sm">
        <div className="p-5 space-y-3">
          <h3 className="font-heading text-sm font-bold text-foreground">{t('connect_telegram')}</h3>
          {c.connectLoading && <p className="text-xs text-muted-foreground">{t('generating_code')}</p>}
          {c.connectResult && (
            <div className="space-y-3">
              <div className="text-center py-3 bg-info/10 rounded-lg border border-info/20">
                <p className="text-[10px] text-info uppercase tracking-wider font-bold">{t('connect_code')}</p>
                <p className="text-2xl font-mono font-bold text-info tracking-widest mt-1">
                  {c.connectResult.code}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {t('expires')}: {new Date(c.connectResult.expiresAt).toLocaleTimeString()}
                </p>
              </div>
              {c.connectResult.deepLink && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground">{t('share_link_prompt')}</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={c.connectResult.deepLink}
                      className="w-full px-2 py-1.5 rounded-lg border border-border text-[11px] font-mono bg-muted text-foreground"
                    />
                    <button
                      onClick={c.handleCopyLink}
                      className="px-2.5 py-1.5 rounded-lg border border-border text-primary hover:bg-muted transition cursor-pointer shrink-0"
                    >
                      {c.copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">{t('telegram_connect_instructions')}</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={c.showMessages} onClose={c.closeMessages} size="sm">
        <div className="p-5 flex flex-col h-[60vh]">
          <h3 className="font-heading text-sm font-bold text-foreground mb-3">{t('messages')}</h3>
          <div className="flex-1 overflow-y-auto space-y-2 pb-2">
            {c.messagesQuery.data?.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">{t('no_messages_yet')}</p>
            )}
            {c.messagesQuery.data?.map((m) => (
              <div key={m.id} className={`flex ${m.senderType === 'staff' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                    m.senderType === 'staff'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted border border-border text-foreground'
                  }`}
                >
                  {m.body}
                </div>
              </div>
            ))}
            <div ref={threadEndRef} />
          </div>
          <form onSubmit={c.handleSendReply} className="flex gap-2 pt-2 border-t border-border">
            <input
              value={c.draft}
              onChange={(e) => c.setDraft(e.target.value)}
              placeholder={t('message_placeholder')}
              className="flex-1 px-3 py-2 rounded-lg border border-border text-xs bg-card text-foreground focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={c.sendMessage.isPending || !c.draft.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {t('send')}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
