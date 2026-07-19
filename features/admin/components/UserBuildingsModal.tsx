'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Property, AppLanguage } from '@/lib/types';
import { AdminUser } from '../users.api';
import { BuildingPicker } from './BuildingPicker';

/** Edit which buildings an existing user is restricted to. */
export function UserBuildingsModal({
  user,
  properties,
  lang,
  busy,
  onClose,
  onSave,
}: {
  user: AdminUser;
  properties: Property[];
  lang: AppLanguage;
  busy: boolean;
  onClose: () => void;
  onSave: (propertyIds: string[]) => void;
}) {
  const t = useTranslations('Admin');
  const [selected, setSelected] = useState<string[]>(user.propertyIds);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(selected);
  }

  return (
    <Modal open onClose={onClose} size="sm">
      <ModalHeader title={t('assign_buildings_title')} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <p className="text-sm font-medium text-foreground">{user.name}</p>
        <BuildingPicker properties={properties} selected={selected} onToggle={toggle} lang={lang} />
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
