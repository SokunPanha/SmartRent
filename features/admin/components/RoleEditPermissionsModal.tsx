'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { PermissionKey } from '@/lib/permissions';
import { Role, UpdateRoleInput } from '../roles.api';
import { PermissionChecklist } from './PermissionChecklist';

/** Edit an existing role's permission set (not its name/description). */
export function RoleEditPermissionsModal({
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
  const [perms, setPerms] = useState<Set<PermissionKey>>(new Set(role.permissions));

  const toggle = (key: PermissionKey) =>
    setPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ permissions: [...perms] });
  }

  return (
    <Modal open onClose={onClose} size="sm">
      <ModalHeader title={t('edit_permissions_title')} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <p className="text-sm font-medium text-foreground">{role.name}</p>
        <PermissionChecklist selected={perms} onToggle={toggle} />
        <ModalFooter
          cancelLabel={t('cancel')}
          onCancel={onClose}
          submitLabel={t('save')}
          submitDisabled={busy}
        />
      </form>
    </Modal>
  );
}
