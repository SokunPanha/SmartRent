'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Input } from '@/components/ui/input';
import { AdminUser, UpdateUserInput } from '../users.api';

/** Edit an existing user's info and optionally reset their password. */
export function UserEditModal({
  user,
  busy,
  onClose,
  onSave,
}: {
  user: AdminUser;
  busy: boolean;
  onClose: () => void;
  onSave: (patch: UpdateUserInput) => void;
}) {
  const t = useTranslations('Admin');
  const [name, setName] = useState(user.name);
  const [nameKh, setNameKh] = useState(user.nameKh ?? '');
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [position, setPosition] = useState(user.position ?? '');
  const [preferredLang, setPreferredLang] = useState(user.preferredLang ?? '');
  const [active, setActive] = useState(user.active);
  const [password, setPassword] = useState('');

  const valid = name.trim() && email.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const patch: UpdateUserInput = {
      name: name.trim(),
      nameKh: nameKh.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      position: position.trim(),
      preferredLang,
      active,
    };
    if (password) patch.password = password;
    onSave(patch);
  }

  return (
    <Modal open onClose={onClose} size="sm">
      <ModalHeader title={t('edit_user_title')} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <Field label={`${t('user_fullname_label')} *`}>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label={t('user_namekh_label')}>
          <Input value={nameKh} onChange={(e) => setNameKh(e.target.value)} placeholder={t('user_namekh_placeholder')} />
        </Field>
        <Field label={`${t('user_email_label')} *`}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('phone_label')}>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phone_placeholder')} className="font-mono" />
          </Field>
          <Field label={t('position_label')}>
            <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder={t('position_placeholder')} />
          </Field>
        </div>
        <Field label={t('preferred_lang_label')}>
          <select
            value={preferredLang}
            onChange={(e) => setPreferredLang(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-card px-4 font-sans text-sm focus:border-primary focus:outline-none"
          >
            <option value="">{t('lang_default')}</option>
            <option value="en">{t('lang_en')}</option>
            <option value="km">{t('lang_kh')}</option>
          </select>
        </Field>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-primary" />
          {t('active_label')}
        </label>
        <Field label={t('new_password_label')}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
            autoComplete="new-password"
          />
          <p className="text-[11px] italic text-muted-foreground">{t('password_keep_blank')}</p>
        </Field>
        <ModalFooter
          cancelLabel={t('cancel')}
          onCancel={onClose}
          submitLabel={t('save')}
          submitDisabled={busy || !valid}
        />
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-sans text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
