import { useTranslations } from 'next-intl';
import { ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeleteButton } from '@/components/shared/DeleteButton';
import { Pagination, usePagination } from '@/components/shared/Pagination';
import { AdminUser } from '../users.api';
import { Role } from '../roles.api';

// Radix Select reserves the empty string for "no selection" internally, so the
// "— none —" option (a real, selectable state meaning "no role assigned")
// needs a distinct sentinel value instead of "".
const NO_ROLE_VALUE = '__none__';

export function UserTable({
  users,
  roles,
  currentEmail,
  busy,
  onChangeRole,
  onEditBuildings,
  onDelete,
}: {
  users: AdminUser[];
  roles: Role[];
  currentEmail: string;
  busy: boolean;
  onChangeRole: (id: string, roleId: string) => void;
  onEditBuildings: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}) {
  const t = useTranslations('Admin');
  const { page, totalPages, pageRows, setPage, pageSize } = usePagination(users);
  return (
    <div className="bg-card rounded-(--radius-card) border border-border overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[55vh] scroll-x-hint">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans dark:font-mono">
              <th className="p-4 pl-6">{t('table_user')}</th>
              <th className="p-4">{t('table_email')}</th>
              <th className="p-4">{t('table_role')}</th>
              <th className="p-4">{t('buildings')}</th>
              <th className="p-4 pr-6 text-right">{t('table_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-muted-foreground font-sans">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted-foreground italic">
                  {t('no_users_found')}
                </td>
              </tr>
            ) : (
              pageRows.map((u) => {
                const isSelf = u.email === currentEmail;
                // System-role users (super admins) can't be reassigned away from here.
                const lockRole = isSelf || !!u.isSystemRole;
                return (
                  <tr key={u.id} className="hover:bg-muted/50 transition">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">
                            {u.name}
                            {isSelf && (
                              <span className="ml-1 text-[9px] uppercase font-bold text-primary">(you)</span>
                            )}
                          </span>
                          {u.nameKh && <span className="text-[10px] text-muted-foreground">{u.nameKh}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <Select
                        value={u.roleId ?? NO_ROLE_VALUE}
                        disabled={busy || lockRole}
                        onValueChange={(v) => onChangeRole(u.id, v === NO_ROLE_VALUE ? '' : v)}
                      >
                        <SelectTrigger
                          className="w-fit data-[size=default]:h-auto gap-1 rounded-lg bg-muted p-1 px-1.5 text-[11px] font-sans shadow-none"
                          title={lockRole ? 'This account’s role is locked here' : undefined}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {u.roleId === null && <SelectItem value={NO_ROLE_VALUE}>— none —</SelectItem>}
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      {u.isSystemRole ? (
                        <span className="text-[11px] text-muted-foreground">{t('buildings_all')}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">
                            {u.propertyIds.length === 0
                              ? t('buildings_all')
                              : t('buildings_assigned', { count: u.propertyIds.length })}
                          </span>
                          <button
                            type="button"
                            onClick={() => onEditBuildings(u)}
                            disabled={busy}
                            className="cursor-pointer rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-foreground transition hover:border-primary/40 hover:bg-accent disabled:opacity-50"
                          >
                            {t('manage_buildings')}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <DeleteButton
                        onClick={() => onDelete(u)}
                        disabled={busy || isSelf}
                        size="md"
                        title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={users.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
