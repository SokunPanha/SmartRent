'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Input } from '@/components/ui/input';
import { Role, UpdateRoleInput } from '../roles.api';

/** Edit an existing role's name + description (not its permissions). */
export function RoleEditInfoModal({
  role,
  busy,
  onClose,
  onSave,
}: {
  role: Role;
  busy: boolean;
  onClose: () => void;
  onSave: (patch: UpdateRoleInput) => void;
}) {
  const t = useTranslations('Admin');
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() });
  }

  return (
    <Modal open onClose={onClose} size="sm">
      <ModalHeader title={t('edit_info_title')} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="space-y-1.5">
          <label className="block font-sans text-xs font-medium text-muted-foreground">
            {t('role_name')} *
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="block font-sans text-xs font-medium text-muted-foreground">
            {t('role_description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('role_description_placeholder')}
            rows={3}
            className="w-full resize-none rounded-xl border border-input bg-card px-4 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <ModalFooter
          cancelLabel={t('cancel')}
          onCancel={onClose}
          submitLabel={t('save')}
          submitDisabled={busy || !name.trim()}
        />
      </form>
    </Modal>
  );
}
