'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { useRent } from '@/store/rent-store';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';
import { useCan, useMyPermissions } from './permissions.queries';
import { useUsers, useUserMutations } from './users.queries';
import { useRoles } from './roles.queries';
import { AdminUser } from './users.api';
import { UserTable } from './components/UserTable';
import { UserFormModal } from './components/UserFormModal';

/** Admin screen: manage user accounts and assign them to roles. */
export default function UsersAdmin() {
  const t = useTranslations('Admin');
  const { userEmail, mounted, sessionLoading, isSuperAdmin } = useRent();
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
  const { create, update, remove } = useUserMutations();
  const [showCreate, setShowCreate] = useState(false);

  const busy = create.isPending || update.isPending || remove.isPending;

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

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground italic">
          {t('loading_users')}
        </div>
      ) : (
        <UserTable
          users={users}
          roles={roles}
          currentEmail={userEmail}
          busy={busy}
          onChangeRole={handleChangeRole}
          onDelete={handleDelete}
        />
      )}

      <UserFormModal
        open={showCreate}
        roles={roles}
        busy={create.isPending}
        onClose={() => setShowCreate(false)}
        onSubmit={(data) => create.mutate(data, { onSuccess: () => setShowCreate(false) })}
      />
    </div>
  );
}
