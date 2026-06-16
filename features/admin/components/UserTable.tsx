import { Trash2, ShieldCheck } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { AdminUser } from '../users.api';
import { Role } from '../roles.api';

export function UserTable({
  users,
  roles,
  currentEmail,
  busy,
  onChangeRole,
  onDelete,
  lang,
}: {
  users: AdminUser[];
  roles: Role[];
  currentEmail: string;
  busy: boolean;
  onChangeRole: (id: string, roleId: string) => void;
  onDelete: (user: AdminUser) => void;
  lang: AppLanguage;
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-3xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans">
              <th className="p-4 pl-6">{lang === 'en' ? 'User' : 'អ្នកប្រើ'}</th>
              <th className="p-4">Email</th>
              <th className="p-4">{lang === 'en' ? 'Role' : 'តួនាទី'}</th>
              <th className="p-4 pr-6 text-right">{lang === 'en' ? 'Actions' : 'សកម្មភាព'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-muted-foreground font-sans">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted-foreground italic">
                  {lang === 'en' ? 'No users found.' : 'មិនមានអ្នកប្រើប្រាស់ឡើយ។'}
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u.email === currentEmail;
                // System-role users (super admins) can't be reassigned away from here.
                const lockRole = isSelf || !!u.isSystemRole;
                return (
                  <tr key={u.id} className="hover:bg-muted/50 transition">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">
                            {u.name}
                            {isSelf && (
                              <span className="ml-1 text-[9px] uppercase font-bold text-indigo-500">(you)</span>
                            )}
                          </span>
                          {u.nameKh && <span className="text-[10px] text-muted-foreground">{u.nameKh}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.roleId ?? ''}
                        disabled={busy || lockRole}
                        onChange={(e) => onChangeRole(u.id, e.target.value)}
                        className="bg-muted border border-border rounded-lg p-1 px-1.5 text-[11px] font-sans focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        title={lockRole ? 'This account’s role is locked here' : undefined}
                      >
                        {u.roleId === null && <option value="">— none —</option>}
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => onDelete(u)}
                        disabled={busy || isSelf}
                        className="text-muted-foreground hover:text-rose-600 p-1 rounded-md hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                        title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
