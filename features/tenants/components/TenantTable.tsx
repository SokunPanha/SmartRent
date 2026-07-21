'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Users, UserPlus, Search, ChevronRight } from 'lucide-react';
import { Tenant, AppLanguage } from '@/lib/types';
import { DeleteButton } from '@/components/shared/DeleteButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Pagination, usePagination } from '@/components/shared/Pagination';
import { pickLocale } from '@/lib/i18n';

export function TenantTable({
  tenants,
  search,
  onSearchChange,
  canModify,
  onAdd,
  onDelete,
  lang,
}: {
  tenants: Tenant[];
  search: string;
  onSearchChange: (value: string) => void;
  canModify: boolean;
  onAdd: () => void;
  onDelete: (id: string, name: string) => void;
  lang: AppLanguage;
}) {
  const t = useTranslations('Tenants');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const { page, totalPages, pageRows, setPage, pageSize } = usePagination(tenants);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card p-3.5 rounded-xl border border-border shadow-3xs">
        <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5 font-sans">
          <Users className="w-4 h-4 text-primary" />
          {t('tenant_list')}
        </h3>
        {canModify && (
          <button
            onClick={onAdd}
            className="p-1 px-2.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1 cursor-pointer"
            id="open-add-tenant-modal"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {t('register')}
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-border text-xs bg-card text-foreground font-sans focus:outline-none focus:border-primary"
          id="tenant-search-input"
        />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-3xs overflow-hidden" id="tenants-table-view">
        {tenants.length === 0 ? (
          <EmptyState icon={Users} title={t('no_tenants_match_search')} className="p-12 shadow-none border-0" />
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {t('tenant_name')}
                    </th>
                    <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {t('phone')}
                    </th>
                    <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {t('national_id')}
                    </th>
                    <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {t('check_in')}
                    </th>
                    <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      Telegram
                    </th>
                    <th className="text-right font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {tCommon('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((tenant) => (
                    <tr
                      key={tenant.id}
                      onClick={() => router.push(`/tenants/${tenant.id}`)}
                      className="border-b border-border/60 last:border-0 hover:bg-primary/[0.04] transition cursor-pointer"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-foreground font-sans">
                          {pickLocale(lang, tenant.name, tenant.nameKh)}
                        </div>
                        {lang === 'kh' && tenant.name !== tenant.nameKh && (
                          <div className="text-xs text-muted-foreground font-sans">{tenant.name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-muted-foreground">{tenant.phone}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{tenant.nationalId}</td>
                      <td className="px-4 py-3.5 text-muted-foreground font-sans">{tenant.checkInDate}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge tone={tenant.telegramChatId ? 'success' : 'info'}>
                          {tenant.telegramChatId ? t('connected') : t('telegram_not_connected')}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          {canModify && (
                            <DeleteButton
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(tenant.id, tenant.name);
                              }}
                              title={t('delete_tenant')}
                              className="p-1.5 bg-muted border border-border rounded-lg"
                            />
                          )}
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: same rows as cards */}
            <div className="sm:hidden divide-y divide-border/60">
              {pageRows.map((tenant) => (
                <div
                  key={tenant.id}
                  onClick={() => router.push(`/tenants/${tenant.id}`)}
                  className="p-4 flex items-center justify-between gap-2 cursor-pointer active:bg-primary/[0.04] transition"
                >
                  <div>
                    <h4 className="font-bold text-foreground text-sm font-sans">
                      {pickLocale(lang, tenant.name, tenant.nameKh)}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{tenant.phone}</p>
                    <div className="mt-1.5">
                      <StatusBadge tone={tenant.telegramChatId ? 'success' : 'info'}>
                        {tenant.telegramChatId ? t('connected') : t('telegram_not_connected')}
                      </StatusBadge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {canModify && (
                      <DeleteButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(tenant.id, tenant.name);
                        }}
                        title={t('delete_tenant')}
                        className="p-1.5 bg-muted border border-border rounded-lg"
                      />
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={tenants.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
