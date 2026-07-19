import { useTranslations } from 'next-intl';
import { FileText, Plus, KeyRound, CalendarDays } from 'lucide-react';
import { Tenant, Contract, Room, Property, AppLanguage } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, StatusBadgeTone } from '@/components/shared/StatusBadge';
import { DeleteButton } from '@/components/shared/DeleteButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { pickLocale } from '@/lib/i18n';
import { getRoomName, getTenantName } from '../tenants.helpers';

export function ContractList({
  contracts,
  rooms,
  properties,
  tenants,
  vacantRooms,
  statusFilter,
  onStatusFilterChange,
  propertyFilter,
  onPropertyFilterChange,
  canModify,
  onAdd,
  onUpdateStatus,
  onDelete,
  lang,
}: {
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  tenants: Tenant[];
  vacantRooms: Room[];
  statusFilter: 'all' | 'active' | 'suspended' | 'expired';
  onStatusFilterChange: (status: 'all' | 'active' | 'suspended' | 'expired') => void;
  propertyFilter: string;
  onPropertyFilterChange: (id: string) => void;
  canModify: boolean;
  onAdd: () => void;
  onUpdateStatus: (id: string, status: 'active' | 'suspended' | 'expired') => void;
  onDelete: (id: string) => void;
  lang: AppLanguage;
}) {
  const t = useTranslations('Tenants');
  return (
    <div className="lg:col-span-7 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card p-3.5 rounded-xl border border-border shadow-3xs">
        <h3 className="text-sm font-bold text-foreground tracking-tight uppercase flex items-center gap-1.5 font-sans">
          <FileText className="w-4 h-4 text-primary" />
          {t('contracts_list')}
        </h3>
        {canModify && vacantRooms.length > 0 && tenants.length > 0 && (
          <button
            onClick={onAdd}
            className="p-1 px-2.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1 cursor-pointer animate-pulse"
            id="open-add-contract-modal"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('add_contract')}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{t('status_label')}</span>
          <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as typeof statusFilter)}>
            <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_statuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="suspended">{t('suspended')}</SelectItem>
              <SelectItem value="expired">{t('expired')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{t('property_label')}</span>
          <Select value={propertyFilter} onValueChange={onPropertyFilterChange}>
            <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_properties')}</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {pickLocale(lang, p.name, p.nameKh)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4" id="contracts-list-view">
        {contracts.length === 0 ? (
          <EmptyState icon={FileText} title={t('no_contracts')} className="p-12 shadow-xs" />
        ) : (
          contracts.map((contract) => {
            const roomNameStr = getRoomName(rooms, properties, contract.roomId, lang);
            const tenantNameStr = getTenantName(tenants, contract.tenantId, lang);

            let statusTone: StatusBadgeTone = 'success';
            let statusLabel = t('active');
            if (contract.status === 'suspended') {
              statusTone = 'warning';
              statusLabel = t('suspended');
            } else if (contract.status === 'expired') {
              statusTone = 'danger';
              statusLabel = t('expired');
            }

            return (
              <div
                key={contract.id}
                className="bg-card p-5 rounded-xl border border-border shadow-3xs flex flex-col justify-between hover:border-border transition"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge tone={statusTone} className="uppercase tracking-wider py-0.5">
                        {statusLabel}
                      </StatusBadge>
                      <span className="font-mono text-xs text-muted-foreground">ID: {contract.id}</span>
                    </div>
                    <h4 className="font-bold text-foreground text-base mt-1 flex items-center gap-1 font-sans">
                      <KeyRound className="w-4 h-4 text-primary" />
                      {roomNameStr}
                    </h4>
                  </div>

                  {canModify && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={contract.status}
                        onValueChange={(v) =>
                          onUpdateStatus(contract.id, v as 'active' | 'suspended' | 'expired')
                        }
                      >
                        <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 rounded-lg bg-muted p-1 px-1.5 text-[11px] font-sans shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">{t('active')}</SelectItem>
                          <SelectItem value="suspended">{t('suspended')}</SelectItem>
                          <SelectItem value="expired">{t('expired')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <DeleteButton onClick={() => onDelete(contract.id)} title={t('terminate_record')} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-border text-xs font-sans">
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block">{t('tenant_name')}</span>
                    <span className="font-semibold text-foreground block mt-1">{tenantNameStr}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block">{t('monthly_rent')}</span>
                    <span className="font-bold text-foreground font-mono block mt-1 text-sm bg-muted px-2 py-0.5 rounded-md inline-block">
                      ${contract.rentAmount}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block">{t('deposit')}</span>
                    <span className="font-bold text-chart-2 font-mono block mt-1">${contract.depositAmount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block">
                      {t('rental_period')}
                    </span>
                    <span className="text-muted-foreground block mt-1 text-[11px] flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground inline" />
                      {contract.startDate} {'→'} {contract.endDate}
                    </span>
                  </div>
                </div>

                <div className="pt-3 flex justify-between items-center text-[11px] text-muted-foreground font-sans">
                  <div className="flex gap-4">
                    <span>
                      {t('el_rate')}: <strong className="text-chart-1 font-mono">{contract.electricityRate} ៛/kWh</strong>
                    </span>
                    <span>
                      {t('wt_rate')}: <strong className="text-info font-mono">{contract.waterRate} ៛/m³</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono italic">
                    Cambodian Riel Conversions Applied
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
