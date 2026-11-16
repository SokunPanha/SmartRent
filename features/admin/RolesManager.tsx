'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Plus, Search } from 'lucide-react';
import { useRent } from '@/store/rent-store';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';
import { useCan, useMyPermissions } from './permissions.queries';
import { useRoles, useRoleMutations } from './roles.queries';
import { Role } from './roles.api';
import { RolesTable } from './components/RolesTable';
import { RoleFormModal } from './components/RoleFormModal';
import { RoleEditInfoModal } from './components/RoleEditInfoModal';
import { RoleEditPermissionsModal } from './components/RoleEditPermissionsModal';

export default function RolesManager() {
  const t = useTranslations('Admin');
  const { mounted, sessionLoading, isSuperAdmin } = useRent();
  const can = useCan();
  const router = useRouter();
  const confirm = useConfirm();
  const allowed = can('admin.access');
  // Super admins are known instantly from the session; everyone else needs
  // the permissions fetch to resolve before "not allowed" is trustworthy.
  const { isLoading: permissionsLoading } = useMyPermissions();
  const authReady = mounted && !sessionLoading && (isSuperAdmin || !permissionsLoading);

  useEffect(() => {
    if (authReady && !allowed) router.replace('/dashboard');
  }, [authReady, allowed, router]);

  const { data: roles = [], isLoading } = useRoles();
  const { create, update, remove } = useRoleMutations();

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editInfoRole, setEditInfoRole] = useState<Role | null>(null);
  const [editPermsRole, setEditPermsRole] = useState<Role | null>(null);

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(query));
  }, [roles, search]);

  async function handleDelete(role: Role) {
    const ok = await confirm({
      title: t('delete_role_confirm_title', { name: role.name }),
      confirmLabel: t('delete'),
      variant: 'destructive',
    });
    if (ok) remove.mutate(role.id);
  }

  if (!authReady || !allowed) {
    const label = !authReady ? t('loading') : t('redirecting');
    return (
      <div className="bg-card rounded-xl border border-(--card-border) p-12 text-center text-sm text-muted-foreground italic">
        {label}
      </div>
    );
  }

  return (
    <div className="space-y-6" id="roles-manager-page">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card p-4 rounded-xl border border-(--card-border) shadow-card">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-1.5 font-sans">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {t('roles_permissions')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">{t('roles_permissions_desc')}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          {t('add_role')}
        </button>
      </div>

      <div className="bg-card p-4 rounded-xl border border-(--card-border) shadow-card">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_role_placeholder')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-(--card-border) text-xs bg-card text-foreground font-sans focus:outline-none focus:border-primary"
            id="role-search-input"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border border-(--card-border) p-12 text-center text-sm text-muted-foreground italic">
          {t('loading_roles')}
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-card rounded-xl border border-(--card-border) p-12 text-center text-sm text-muted-foreground italic">
          {t('no_roles_found')}
        </div>
      ) : (
        <RolesTable
          roles={filteredRoles}
          busy={update.isPending || remove.isPending}
          onEditInfo={setEditInfoRole}
          onEditPermissions={setEditPermsRole}
          onDelete={handleDelete}
        />
      )}

      {showCreate && (
        <RoleFormModal
          busy={create.isPending}
          onClose={() => setShowCreate(false)}
          onSubmit={(data) => create.mutate(data, { onSuccess: () => setShowCreate(false) })}
        />
      )}

      {editInfoRole && (
        <RoleEditInfoModal
          role={editInfoRole}
          busy={update.isPending}
          onClose={() => setEditInfoRole(null)}
          onSave={(patch) =>
            update.mutate({ id: editInfoRole.id, patch }, { onSuccess: () => setEditInfoRole(null) })
          }
        />
      )}

      {editPermsRole && (
        <RoleEditPermissionsModal
          role={editPermsRole}
          busy={update.isPending}
          onClose={() => setEditPermsRole(null)}
          onSave={(patch) =>
            update.mutate({ id: editPermsRole.id, patch }, { onSuccess: () => setEditPermsRole(null) })
          }
        />
      )}
    </div>
  );
}
