import { useTranslations } from 'next-intl';
import { Tenant, Room, Property, AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pickLocale } from '@/lib/i18n';
import { getRoomName } from '../tenants.helpers';
import { useTenantsController } from '../use-tenants-controller';

type Controller = ReturnType<typeof useTenantsController>;

export function ContractModal({
  c,
  tenants,
  rooms,
  properties,
  lang,
}: {
  c: Controller;
  tenants: Tenant[];
  rooms: Room[];
  properties: Property[];
  lang: AppLanguage;
}) {
  const t = useTranslations('Tenants');
  const tCommon = useTranslations('Common');
  return (
    <Modal open={c.showContractModal} onClose={c.closeContractModal} size="md">
      <ModalHeader title={t('add_contract')} onClose={c.closeContractModal} />

      <form onSubmit={c.handleCreateContract} className="p-4 space-y-4">
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              Select Available Vacant Room *
            </label>
            <Select value={c.conRoomId} onValueChange={c.handleRoomSelectInContract}>
              <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-sm font-sans focus-visible:border-primary focus-visible:ring-primary/30">
                <SelectValue placeholder={t('select_room_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {c.vacantRooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {getRoomName(rooms, properties, r.id, lang)} (${r.rentAmount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {c.vacantRooms.length === 0 && (
              <span className="text-[10px] text-destructive italic mt-0.5 block">
                {t('no_vacant_rooms')}
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              Select Tenant Customer *
            </label>
            <Select value={c.conTenantId} onValueChange={c.setConTenantId}>
              <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-sm font-sans focus-visible:border-primary focus-visible:ring-primary/30">
                <SelectValue placeholder={t('select_tenant_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tn) => (
                  <SelectItem key={tn.id} value={tn.id}>
                    {pickLocale(lang, tn.name, tn.nameKh)} ({tn.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                Start Date *
              </label>
              <input
                type="date"
                value={c.conStartDate}
                onChange={(e) => c.setConStartDate(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-border text-xs focus:border-primary focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                Expiry Date *
              </label>
              <input
                type="date"
                value={c.conEndDate}
                onChange={(e) => c.setConEndDate(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-border text-xs focus:border-primary focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                Rent Fee (USD/month) *
              </label>
              <input
                type="number"
                value={c.conRent}
                onChange={(e) => c.setConRent(Number(e.target.value))}
                min={10}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                Security Deposit (USD) *
              </label>
              <input
                type="number"
                value={c.conDeposit}
                onChange={(e) => c.setConDeposit(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-muted p-3 rounded-xl border border-border">
            <div>
              <label className="text-[10px] font-bold text-chart-1 uppercase tracking-wider block mb-1 font-sans flex items-center gap-0.5">
                Electric Rate (៛/kWh) *
              </label>
              <input
                type="number"
                value={c.conElecRate}
                onChange={(e) => c.setConElecRate(Number(e.target.value))}
                min={300}
                max={10000}
                step={50}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-xs focus:border-chart-1 focus:outline-none font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-info uppercase tracking-wider block mb-1 font-sans">
                Water Rate (៛/m³) *
              </label>
              <input
                type="number"
                value={c.conWaterRate}
                onChange={(e) => c.setConWaterRate(Number(e.target.value))}
                min={300}
                max={10000}
                step={100}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-xs focus:border-info focus:outline-none font-mono font-bold"
                required
              />
            </div>
          </div>
        </div>

        <ModalFooter
          cancelLabel={tCommon('cancel')}
          onCancel={c.closeContractModal}
          submitLabel={tCommon('save')}
          submitDisabled={c.vacantRooms.length === 0}
        />
      </form>
    </Modal>
  );
}
