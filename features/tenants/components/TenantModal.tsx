import { X } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { useTenantsController } from '../use-tenants-controller';

type Controller = ReturnType<typeof useTenantsController>;

export function TenantModal({ c, t, lang }: { c: Controller; t: any; lang: AppLanguage }) {
  return (
    <Modal open={c.showTenantModal} onClose={c.closeTenantModal} size="sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-bold text-foreground text-base font-sans">{t.add_tenant}</h3>
        <button
          onClick={c.closeTenantModal}
          className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-muted-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={c.handleCreateTenant} className="p-4 space-y-4">
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              Tenant Full Name (English) *
            </label>
            <input
              type="text"
              value={c.tenantName}
              onChange={(e) => c.setTenantName(e.target.value)}
              placeholder="e.g. Sok Chamroeun"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              ឈ្មោះពេញភាសាខ្មែរ *
            </label>
            <input
              type="text"
              value={c.tenantNameKh}
              onChange={(e) => c.setTenantNameKh(e.target.value)}
              placeholder="ឧ. សុខ ចំរើន"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                {t.phone} *
              </label>
              <input
                type="text"
                value={c.tenantPhone}
                onChange={(e) => c.setTenantPhone(e.target.value)}
                placeholder="e.g. 012 345 678"
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                {t.national_id} *
              </label>
              <input
                type="text"
                value={c.tenantNID}
                onChange={(e) => c.setTenantNID(e.target.value)}
                placeholder="e.g. 120485934"
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              Email Address
            </label>
            <input
              type="email"
              value={c.tenantEmail}
              onChange={(e) => c.setTenantEmail(e.target.value)}
              placeholder="e.g. sok.chamroeun99@gmail.com"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 bg-info/10 p-3.5 rounded-xl border border-info/20">
            <div>
              <label className="text-[10px] font-bold text-info uppercase tracking-wider block mb-1 font-sans">
                Telegram Chat ID
              </label>
              <input
                type="text"
                value={c.tenantTelegramChatId}
                onChange={(e) => c.setTenantTelegramChatId(e.target.value)}
                placeholder="e.g. 129482938"
                className="w-full px-3 py-1.5 rounded-lg border border-info/30 text-xs focus:border-info focus:outline-none font-mono focus:bg-card bg-card/70 text-info font-bold"
              />
              <span className="text-[8px] text-info block mt-0.5">Find via @CheckMyIDBot</span>
            </div>
            <div className="flex flex-col justify-center">
              <label className="text-[10px] font-bold text-info uppercase tracking-wider block mb-1 font-sans">
                Autosend Invoice
              </label>
              <label className="inline-flex items-center gap-2 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={c.tenantTelegramAutoSend}
                  onChange={(e) => c.setTenantTelegramAutoSend(e.target.checked)}
                  className="rounded border-info/40 text-info focus:ring-info w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-info font-semibold">
                  {lang === 'en' ? 'Yes, automated' : 'បាទ ស្វ័យប្រវត្តិ'}
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                {t.check_in} *
              </label>
              <input
                type="date"
                value={c.tenantCheckIn}
                onChange={(e) => c.setTenantCheckIn(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-border text-xs focus:border-primary focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                {t.emergency_contact}
              </label>
              <input
                type="text"
                value={c.tenantEmergency}
                onChange={(e) => c.setTenantEmergency(e.target.value)}
                placeholder="e.g. Wife - 016 999 888"
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={c.closeTenantModal}
            className="flex-1 py-2 rounded-lg text-sm border border-border hover:bg-muted transition cursor-pointer font-sans"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition font-semibold cursor-pointer font-sans"
          >
            {t.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
