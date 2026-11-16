import { useTranslations } from 'next-intl';
import { FileText, CalendarDays } from 'lucide-react';
import { Tenant, Contract, Room, Property, AppLanguage } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, StatusBadgeTone } from '@/components/shared/StatusBadge';
import { LeaseActions, DepositBadge } from './LeaseActions';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination, usePagination } from '@/components/shared/Pagination';
import { pickLocale } from '@/lib/i18n';
import { getRoomName, getTenantName } from '../tenants.helpers';

function statusMeta(
  status: Contract['status'],
  t: (k: string) => string
): { tone: StatusBadgeTone; label: string } {
  if (status === 'suspended') return { tone: 'warning', label: t('suspended') };
  if (status === 'expired') return { tone: 'danger', label: t('expired') };
  return { tone: 'success', label: t('active') };
}

export function ContractTable({
  contracts,
  rooms,
  properties,
  tenants,
  statusFilter,
  onStatusFilterChange,
  propertyFilter,
  onPropertyFilterChange,
  canModify,
  onUpdateStatus,
  onDelete,
  lang,
}: {
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  tenants: Tenant[];
  statusFilter: 'all' | 'active' | 'suspended' | 'expired';
  onStatusFilterChange: (status: 'all' | 'active' | 'suspended' | 'expired') => void;
  propertyFilter: string;
  onPropertyFilterChange: (id: string) => void;
  canModify: boolean;
  onUpdateStatus: (id: string, status: 'active' | 'suspended' | 'expired') => void;
  onDelete: (id: string) => void;
  lang: AppLanguage;
}) {
  const t = useTranslations('Tenants');
  const tCommon = useTranslations('Common');
  const { page, totalPages, pageRows, setPage, pageSize } = usePagination(contracts);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card p-3.5 rounded-xl border border-(--card-border) shadow-3xs">
        <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5 font-sans">
          <FileText className="w-4 h-4 text-primary" />
          {t('contracts_list')}
        </h3>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex h-10 items-center gap-1.5 bg-muted px-4 rounded-full border border-border text-xs">
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

        <div className="flex h-10 items-center gap-1.5 bg-muted px-4 rounded-full border border-border text-xs">
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

      <div className="bg-card border border-(--card-border) rounded-xl shadow-3xs overflow-hidden" id="contracts-table-view">
        {contracts.length === 0 ? (
          <EmptyState icon={FileText} title={t('no_contracts')} className="p-12 shadow-none border-0" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {t('tenant_name')}
                    </th>
                    <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {t('room')}
                    </th>
                    <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {tCommon('status')}
                    </th>
                    <th className="text-right font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {t('monthly_rent')}
                    </th>
                    <th className="text-right font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {t('deposit')}
                    </th>
                    <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {t('rental_period')}
                    </th>
                    {canModify && (
                      <th className="text-right font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                        {tCommon('actions')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((contract) => {
                    const s = statusMeta(contract.status, t);
                    return (
                      <tr key={contract.id} className="border-b border-border/60 last:border-0 hover:bg-primary/[0.04] transition">
                        <td className="px-4 py-3.5 font-bold text-foreground font-sans">
                          {getTenantName(tenants, contract.tenantId, lang)}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground font-sans">
                          {getRoomName(rooms, properties, contract.roomId, lang)}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums font-mono font-bold text-foreground">
                          ${contract.rentAmount}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="block tabular-nums font-mono text-foreground">${contract.depositAmount}</span>
                          <DepositBadge contract={contract} />
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground font-sans text-xs">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                            {contract.startDate} {'→'} {contract.endDate}
                          </span>
                        </td>
                        {canModify && (
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 justify-end">
                              <LeaseActions
                                contract={contract}
                                room={rooms.find((r) => r.id === contract.roomId)}
                                canModify={canModify}
                                onDelete={onDelete}
                              />
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={contracts.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
