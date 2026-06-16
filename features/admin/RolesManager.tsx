'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Plus, Trash2, Save, Loader2, Lock } from 'lucide-react';
import { useRent } from '@/store/rent-store';
import { PERMISSION_META, PermissionKey } from '@/lib/permissions';
import { Input } from '@/components/ui/input';
import { useCan } from './permissions.queries';
import { useRoles, useRoleMutations } from './roles.queries';
import { Role } from './roles.api';

export default function RolesManager() {
  const { lang, mounted } = useRent();
  const can = useCan();
  const router = useRouter();
  const allowed = can('admin.access');

  useEffect(() => {
    if (mounted && !allowed) router.replace('/dashboard');
  }, [mounted, allowed, router]);

  const { data: roles = [], isLoading } = useRoles();
  const { create, update, remove } = useRoleMutations();
  const [newRole, setNewRole] = useState('');

  if (!allowed) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground italic">
        {lang === 'en' ? 'Redirecting…' : 'កំពុងបញ្ជូនត្រឡប់…'}
      </div>
    );
  }

  return (
    <div className="space-y-6" id="roles-manager-page">
      <div className="bg-card p-4 rounded-xl border border-border shadow-3xs">
        <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-1.5 font-sans">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          {lang === 'en' ? 'Roles & Permissions' : 'តួនាទី និងសិទ្ធិ'}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 font-sans">
          {lang === 'en'
            ? 'Create roles and choose what each one is allowed to do.'
            : 'បង្កើតតួនាទី និងកំណត់សិទ្ធិសម្រាប់នីមួយៗ។'}
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
            placeholder={lang === 'en' ? 'New role name (e.g. Cashier)' : 'ឈ្មោះតួនាទីថ្មី'}
          />
          <button
            type="submit"
            disabled={create.isPending || !newRole.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {lang === 'en' ? 'Add Role' : 'បន្ថែម'}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground italic">
          {lang === 'en' ? 'Loading roles…' : 'កំពុងផ្ទុក…'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              saving={update.isPending}
              onSave={(patch) => update.mutate({ id: role.id, patch })}
              onDelete={() => {
                if (confirm(`Delete role "${role.name}"?`)) remove.mutate(role.id);
              }}
              lang={lang}
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
  lang,
}: {
  role: Role;
  saving: boolean;
  onSave: (patch: { name?: string; permissions?: PermissionKey[] }) => void;
  onDelete: () => void;
  lang: 'en' | 'kh';
}) {
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
            <Lock className="w-4 h-4 text-indigo-500" />
            {role.name}
            <span className="text-[9px] uppercase font-bold text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
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
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer disabled:opacity-40"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {lang === 'en' ? 'Save' : 'រក្សាទុក'}
              </button>
              <button
                onClick={onDelete}
                className="text-muted-foreground hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-500/10 transition cursor-pointer"
                title={lang === 'en' ? 'Delete role' : 'លុបតួនាទី'}
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
                className="mt-0.5 h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
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
