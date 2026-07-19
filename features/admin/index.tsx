'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShieldCheck, UserPlus, Search } from 'lucide-react';
import { useRent } from '@/store/rent-store';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProperties } from '@/features/properties/properties.queries';
import { useCan, useMyPermissions } from './permissions.queries';
import { useUsers, useUserMutations } from './users.queries';
import { useRoles } from './roles.queries';
import { AdminUser } from './users.api';
import { UserTable } from './components/UserTable';
import { UserFormModal } from './components/UserFormModal';
import { UserBuildingsModal } from './components/UserBuildingsModal';

const NO_ROLE_VALUE = '__none__';

/** Admin screen: manage user accounts and assign them to roles. */
export default function UsersAdmin() {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const { userEmail, mounted, sessionLoading, isSuperAdmin, lang } = useRent();
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

  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const { data: properties = [] } = useProperties();
  const { create, update, remove } = useUserMutations();
  const [showCreate, setShowCreate] = useState(false);
  const [editBuildingsUser, setEditBuildingsUser] = useState<AdminUser | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');

  const busy = create.isPending || update.isPending || remove.isPending;

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((u) => {
      const roleMatch =
        roleFilter === 'all' ||
        (roleFilter === NO_ROLE_VALUE ? u.roleId === null : u.roleId === roleFilter);
      if (!roleMatch) return false;
      if (!query) return true;
      return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    });
  }, [users, roleFilter, search]);

  function handleChangeRole(id: string, roleId: string) {
    update.mutate({ id, patch: { roleId } });
  }

  async function handleDelete(user: AdminUser) {
    const ok = await confirm({
      title: t('delete_user_confirm_title', { email: user.email }),
      description: t('delete_confirm_desc'),
      confirmLabel: t('delete'),
      variant: 'destructive',
    });
    if (ok) remove.mutate(user.id);
  }

  if (!authReady || !allowed) {
    const label = !authReady ? t('loading') : t('redirecting');
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground italic">
        {label}
      </div>
    );
  }

  return (
    <div className="space-y-6" id="users-admin-page">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-3xs">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-1.5 font-sans">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {t('user_management')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">
            {t('user_management_desc')}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={roles.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer self-stretch sm:self-auto justify-center disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          {t('add_user')}
        </button>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-3xs flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-border text-xs bg-card text-foreground font-sans focus:outline-none focus:border-primary"
            id="user-search-input"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{t('role_filter_label')}</span>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_roles')}</SelectItem>
              <SelectItem value={NO_ROLE_VALUE}>{tCommon('no_role')}</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground italic">
          {t('loading_users')}
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          roles={roles}
          currentEmail={userEmail}
          busy={busy}
          onChangeRole={handleChangeRole}
          onEditBuildings={setEditBuildingsUser}
          onDelete={handleDelete}
        />
      )}

      <UserFormModal
        open={showCreate}
        roles={roles}
        properties={properties}
        lang={lang}
        busy={create.isPending}
        onClose={() => setShowCreate(false)}
        onSubmit={(data) => create.mutate(data, { onSuccess: () => setShowCreate(false) })}
      />

      {editBuildingsUser && (
        <UserBuildingsModal
          user={editBuildingsUser}
          properties={properties}
          lang={lang}
          busy={update.isPending}
          onClose={() => setEditBuildingsUser(null)}
          onSave={(propertyIds) =>
            update.mutate(
              { id: editBuildingsUser.id, patch: { propertyIds } },
              { onSuccess: () => setEditBuildingsUser(null) }
            )
          }
        />
      )}
    </div>
  );
}
