'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { Input } from '@/components/ui/input';
import { NewUserInput } from '../users.api';
import { Role } from '../roles.api';

export function UserFormModal({
  open,
  roles,
  busy,
  onClose,
  onSubmit,
  lang,
}: {
  open: boolean;
  roles: Role[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: NewUserInput) => void;
  lang: AppLanguage;
}) {
  const [name, setName] = useState('');
  const [nameKh, setNameKh] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleId) return;
    onSubmit({ name, nameKh: nameKh || undefined, email: email.toLowerCase(), password, roleId });
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-bold text-foreground text-base font-sans">
          {lang === 'en' ? 'Create User' : 'បង្កើតអ្នកប្រើ'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-muted-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-sans">
            Full Name *
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sok Dara" required />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-sans">
            ឈ្មោះជាខ្មែរ
          </label>
          <Input value={nameKh} onChange={(e) => setNameKh(e.target.value)} placeholder="ឧ. សុខ ដារា" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-sans">
            Email *
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@khrent.local"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-sans">
            Password *
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-sans">
            Role *
          </label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-card font-sans focus:border-primary focus:outline-none"
          >
            <option value="" disabled>
              {lang === 'en' ? '— Select a role —' : '— ជ្រើសរើសតួនាទី —'}
            </option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm border border-border hover:bg-muted transition cursor-pointer font-sans"
          >
            {lang === 'en' ? 'Cancel' : 'បោះបង់'}
          </button>
          <button
            type="submit"
            disabled={busy || !roleId}
            className="flex-1 py-2 rounded-lg text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition font-semibold cursor-pointer font-sans disabled:opacity-50"
          >
            {lang === 'en' ? 'Create User' : 'បង្កើត'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
