import { Users, UserPlus, Trash2, Phone, UserSquare, AlertCircle } from 'lucide-react';
import { Tenant, AppLanguage } from '@/lib/types';

export function TenantList({
  tenants,
  canModify,
  onAdd,
  onDelete,
  t,
  lang,
}: {
  tenants: Tenant[];
  canModify: boolean;
  onAdd: () => void;
  onDelete: (id: string, name: string) => void;
  t: any;
  lang: AppLanguage;
}) {
  return (
    <div className="lg:col-span-5 space-y-4">
      <div className="flex justify-between items-center bg-card p-3.5 rounded-xl border border-border shadow-3xs">
        <h3 className="text-sm font-bold text-foreground tracking-tight uppercase flex items-center gap-1.5 font-sans">
          <Users className="w-4 h-4 text-emerald-600" />
          {t.tenant_list}
        </h3>
        {canModify && (
          <button
            onClick={onAdd}
            className="p-1 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
            id="open-add-tenant-modal"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Register' : 'ចុះឈ្មោះ'}
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" id="tenants-stack-scroller">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            className="bg-card p-4 rounded-xl border border-border shadow-3xs flex flex-col justify-between hover:border-border transition"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <h4 className="font-bold text-foreground text-sm font-sans flex items-center gap-1">
                  {lang === 'en' ? tenant.name : tenant.nameKh}
                  {lang === 'kh' && tenant.name !== tenant.nameKh && (
                    <span className="text-xs text-muted-foreground font-normal">({tenant.name})</span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  {t.check_in}: <span className="font-semibold text-foreground">{tenant.checkInDate}</span>
                </p>
              </div>

              {canModify && (
                <button
                  onClick={() => onDelete(tenant.id, tenant.name)}
                  className="text-muted-foreground hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
                  title={lang === 'en' ? 'Delete Tenant' : 'លុបអ្នកជួល'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border text-xs text-muted-foreground font-sans">
              <div className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-mono">{tenant.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <UserSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-mono text-[11px] truncate" title={tenant.nationalId}>
                  {tenant.nationalId}
                </span>
              </div>
            </div>

            {tenant.telegramChatId && (
              <div className="mt-2 p-1.5 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between font-sans text-[10px]">
                <span className="text-indigo-800 font-mono font-bold truncate">✈️ ID: {tenant.telegramChatId}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md font-bold uppercase ${
                    tenant.telegramAutoSend
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                      : 'text-muted-foreground bg-muted border border-border'
                  }`}
                >
                  {tenant.telegramAutoSend
                    ? lang === 'en'
                      ? 'Auto-send'
                      : 'បញ្ជូនស្វ័យប្រវត្តិ'
                    : lang === 'en'
                      ? 'Manual'
                      : 'ដោយដៃ'}
                </span>
              </div>
            )}

            {tenant.emergencyContact && (
              <div className="mt-2.5 p-2 bg-muted rounded-lg text-[10px] text-muted-foreground border border-border flex items-start gap-1 font-sans">
                <AlertCircle className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{tenant.emergencyContact}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
