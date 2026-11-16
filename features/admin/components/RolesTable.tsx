'use client';

import { useTranslations } from 'next-intl';
import { Lock, SquarePen, KeyRound } from 'lucide-react';
import { DeleteButton } from '@/components/shared/DeleteButton';
import { Pagination, usePagination } from '@/components/shared/Pagination';
import { PERMISSION_META } from '@/lib/permissions';
import { Role } from '../roles.api';

export function RolesTable({
  roles,
  busy,
  onEditInfo,
  onEditPermissions,
  onDelete,
}: {
  roles: Role[];
  busy: boolean;
  onEditInfo: (role: Role) => void;
  onEditPermissions: (role: Role) => void;
  onDelete: (role: Role) => void;
}) {
  const t = useTranslations('Admin');
  const total = PERMISSION_META.length;
  const { page, totalPages, pageRows, setPage, pageSize } = usePagination(roles);

  return (
    <div className="bg-card rounded-(--radius-card) border border-(--card-border) shadow-card overflow-hidden">
      <div className="overflow-x-auto scroll-x-hint">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border text-xs font-bold text-muted-foreground font-sans dark:font-mono">
              <th className="p-4 pl-6">{t('table_role')}</th>
              <th className="p-4">{t('role_description')}</th>
              <th className="p-4">{t('table_permissions')}</th>
              <th className="p-4 pr-6 text-right">{t('table_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-muted-foreground font-sans">
            {pageRows.map((role) => {
              const locked = role.isSystem;
              return (
                <tr key={role.id} className="hover:bg-muted/50 transition align-top">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-2">
                      {locked && <Lock className="w-3.5 h-3.5 text-primary shrink-0" />}
                      <span className="font-bold text-foreground text-sm">{role.name}</span>
                      {locked && (
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">
                          {t('role_system_badge')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 max-w-[320px]">
                    <span className="text-muted-foreground line-clamp-2">{role.description || '—'}</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-block text-[11px] font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md">
                      {locked
                        ? t('all_permissions')
                        : role.permissions.length === 0
                          ? t('no_permissions')
                          : `${role.permissions.length} / ${total}`}
                    </span>
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <IconButton
                        title={t('edit_info')}
                        disabled={locked || busy}
                        onClick={() => onEditInfo(role)}
                      >
                        <SquarePen className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        title={t('edit_permissions')}
                        disabled={locked || busy}
                        onClick={() => onEditPermissions(role)}
                      >
                        <KeyRound className="w-4 h-4" />
                      </IconButton>
                      <DeleteButton
                        onClick={() => onDelete(role)}
                        disabled={locked || busy}
                        size="md"
                        title={t('delete_role')}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={roles.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}

function IconButton({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-10 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      {children}
    </button>
  );
}
