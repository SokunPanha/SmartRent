'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Plus, Trash2, Save, Loader2, Lock } from 'lucide-react';
import { useRent } from '@/store/rent-store';
import { PERMISSION_META, PermissionKey } from '@/lib/permissions';
import { Input } from '@/components/ui/input';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';
import { useCan, useMyPermissions } from './permissions.queries';
import { useRoles, useRoleMutations } from './roles.queries';
import { Role } from './roles.api';

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
  const [newRole, setNewRole] = useState('');

  if (!authReady || !allowed) {
    const label = !authReady ? t('loading') : t('redirecting');
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground italic">
        {label}
      </div>
    );
  }

  return (
    <div className="space-y-6" id="roles-manager-page">
      <div className="bg-card p-4 rounded-xl border border-border shadow-3xs">
        <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-1.5 font-sans">
          <ShieldCheck className="w-5 h-5 text-primary" />
          {t('roles_permissions')}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 font-sans">
          {t('roles_permissions_desc')}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = newRole.trim();
            if (name) create.mutate({ name }, { onSuccess: () => setNewRole('') });
          }}
          className="mt-4 flex gap-2 max-w-md"
        >
          <Input
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder={t('new_role_placeholder')}
          />
          <button
            type="submit"
            disabled={create.isPending || !newRole.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t('add_role')}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground italic">
          {t('loading_roles')}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              saving={update.isPending}
              onSave={(patch) => update.mutate({ id: role.id, patch })}
              onDelete={async () => {
                const ok = await confirm({
                  title: t('delete_role_confirm_title', { name: role.name }),
                  confirmLabel: t('delete'),
                  variant: 'destructive',
                });
                if (ok) remove.mutate(role.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RoleCard({
  role,
  saving,
  onSave,
  onDelete,
}: {
  role: Role;
  saving: boolean;
  onSave: (patch: { name?: string; permissions?: PermissionKey[] }) => void;
  onDelete: () => void;
}) {
  const t = useTranslations('Admin');
  const [name, setName] = useState(role.name);
  const [perms, setPerms] = useState<Set<PermissionKey>>(new Set(role.permissions));

  // Re-sync when the underlying role changes (e.g. after a save refetch).
  useEffect(() => {
    setName(role.name);
    setPerms(new Set(role.permissions));
  }, [role]);

  const locked = role.isSystem;
  const dirty =
    !locked &&
    (name.trim() !== role.name ||
      perms.size !== role.permissions.length ||
      role.permissions.some((p) => !perms.has(p)));

  function toggle(key: PermissionKey) {
    if (locked) return;
    setPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-3xs flex flex-col">
      <div className="flex items-center justify-between gap-2 p-4 border-b border-border">
        {locked ? (
          <div className="flex items-center gap-2 font-bold text-foreground text-sm">
            <Lock className="w-4 h-4 text-primary" />
            {role.name}
            <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
              System
            </span>
          </div>
        ) : (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 max-w-[60%] font-bold"
          />
        )}

        <div className="flex items-center gap-1.5">
          {!locked && (
            <>
              <button
                onClick={() => onSave({ name: name.trim(), permissions: [...perms] })}
                disabled={saving || !dirty}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer disabled:opacity-40"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {t('save')}
              </button>
              <button
                onClick={onDelete}
                className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition cursor-pointer"
                title={t('delete_role')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {PERMISSION_META.map((perm) => {
          const checked = locked || perms.has(perm.key);
          return (
            <label
              key={perm.key}
              className={`flex items-start gap-2.5 ${locked ? 'opacity-70' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={locked}
                onChange={() => toggle(perm.key)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
              />
              <span>
                <span className="block text-xs font-semibold text-foreground">{perm.label}</span>
                <span className="block text-[11px] text-muted-foreground">{perm.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
