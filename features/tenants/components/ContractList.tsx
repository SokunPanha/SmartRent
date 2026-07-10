import { FileText, Plus, Trash2, KeyRound, CalendarDays } from 'lucide-react';
import { Tenant, Contract, Room, Property, AppLanguage } from '@/lib/types';
import { getRoomName, getTenantName } from '../tenants.helpers';

export function ContractList({
  contracts,
  rooms,
  properties,
  tenants,
  vacantRooms,
  canModify,
  onAdd,
  onUpdateStatus,
  onDelete,
  t,
  lang,
}: {
  contracts: Contract[];
  rooms: Room[];
  properties: Property[];
  tenants: Tenant[];
  vacantRooms: Room[];
  canModify: boolean;
  onAdd: () => void;
  onUpdateStatus: (id: string, status: 'active' | 'suspended' | 'expired') => void;
  onDelete: (id: string) => void;
  t: any;
  lang: AppLanguage;
}) {
  return (
    <div className="lg:col-span-7 space-y-4">
      <div className="flex justify-between items-center bg-card p-3.5 rounded-xl border border-border shadow-3xs">
        <h3 className="text-sm font-bold text-foreground tracking-tight uppercase flex items-center gap-1.5 font-sans">
          <FileText className="w-4 h-4 text-primary" />
          {t.contracts_list}
        </h3>
        {canModify && vacantRooms.length > 0 && tenants.length > 0 && (
          <button
            onClick={onAdd}
            className="p-1 px-2.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1 cursor-pointer animate-pulse"
            id="open-add-contract-modal"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.add_contract}
          </button>
        )}
      </div>

      <div className="space-y-4" id="contracts-list-view">
        {contracts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-xs">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground mt-2 font-sans italic">
              {lang === 'en' ? 'No contracts on record.' : 'មិនមានកិច្ចសន្យាជួលក្នុងកំណត់ត្រាឡើយ។'}
            </p>
          </div>
        ) : (
          contracts.map((contract) => {
            const roomNameStr = getRoomName(rooms, properties, contract.roomId, lang);
            const tenantNameStr = getTenantName(tenants, contract.tenantId, lang);

            let statusBadge = 'bg-chart-2/10 text-chart-2 border-chart-2/20';
            let statusLabel = t.active;
            if (contract.status === 'suspended') {
              statusBadge = 'bg-chart-1/10 text-chart-1 border-chart-1/20';
              statusLabel = t.suspended;
            } else if (contract.status === 'expired') {
              statusBadge = 'bg-destructive/10 text-destructive border-destructive/20';
              statusLabel = t.expired;
            }

            return (
              <div
                key={contract.id}
                className="bg-card p-5 rounded-xl border border-border shadow-3xs flex flex-col justify-between hover:border-border transition"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full border ${statusBadge}`}>
                        {statusLabel}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">ID: {contract.id}</span>
                    </div>
                    <h4 className="font-bold text-foreground text-base mt-1 flex items-center gap-1 font-sans">
                      <KeyRound className="w-4 h-4 text-primary" />
                      {roomNameStr}
                    </h4>
                  </div>

                  {canModify && (
                    <div className="flex items-center gap-2">
                      <select
                        value={contract.status}
                        onChange={(e) =>
                          onUpdateStatus(contract.id, e.target.value as 'active' | 'suspended' | 'expired')
                        }
                        className="bg-muted border border-border text-[11px] rounded-lg p-1 px-1.5 focus:outline-none font-sans"
                      >
                        <option value="active">{t.active}</option>
                        <option value="suspended">{t.suspended}</option>
                        <option value="expired">{t.expired}</option>
                      </select>
                      <button
                        onClick={() => onDelete(contract.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition cursor-pointer"
                        title={lang === 'en' ? 'Terminate Record' : 'លុបចោល'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-border text-xs font-sans">
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block">{t.tenant_name}</span>
                    <span className="font-semibold text-foreground block mt-1">{tenantNameStr}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block">{t.monthly_rent}</span>
                    <span className="font-bold text-foreground font-mono block mt-1 text-sm bg-muted px-2 py-0.5 rounded-md inline-block">
                      ${contract.rentAmount}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block">{t.deposit}</span>
                    <span className="font-bold text-chart-2 font-mono block mt-1">${contract.depositAmount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] block">
                      {lang === 'en' ? 'Rental Period' : 'រយៈពេលជួល'}
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
                      {t.el_rate}: <strong className="text-chart-1 font-mono">{contract.electricityRate} ៛/kWh</strong>
                    </span>
                    <span>
                      {t.wt_rate}: <strong className="text-info font-mono">{contract.waterRate} ៛/m³</strong>
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
