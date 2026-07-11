'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewUserInput } from '../users.api';
import { Role } from '../roles.api';

export function UserFormModal({
  open,
  roles,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  roles: Role[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: NewUserInput) => void;
}) {
  const t = useTranslations('Admin');
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
      <ModalHeader title={t('create_user_title')} onClose={onClose} />

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
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-sm font-sans focus-visible:border-primary focus-visible:ring-primary/30">
              <SelectValue placeholder={t('select_role')} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ModalFooter
          cancelLabel={t('cancel')}
          onCancel={onClose}
          submitLabel={t('create_user')}
          submitDisabled={busy || !roleId}
        />
      </form>
    </Modal>
  );
}
