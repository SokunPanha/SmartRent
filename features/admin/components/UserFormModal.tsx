'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Property, AppLanguage } from '@/lib/types';
import { NewUserInput } from '../users.api';
import { Role } from '../roles.api';
import { BuildingPicker } from './BuildingPicker';

export function UserFormModal({
  open,
  roles,
  properties,
  lang,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  roles: Role[];
  properties: Property[];
  lang: AppLanguage;
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
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [preferredLang, setPreferredLang] = useState('');
  const [propertyIds, setPropertyIds] = useState<string[]>([]);

  const toggleProperty = (id: string) =>
    setPropertyIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleId) return;
    onSubmit({
      name,
      nameKh: nameKh || undefined,
      email: email.toLowerCase(),
      password,
      roleId,
      phone: phone.trim() || undefined,
      position: position.trim() || undefined,
      preferredLang: preferredLang || undefined,
      propertyIds,
    });
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader title={t('create_user_title')} onClose={onClose} />

      <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground block font-sans">
            {t('user_fullname_label')} *
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('user_fullname_placeholder')} required />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground block font-sans">
            {t('user_namekh_label')}
          </label>
          <Input value={nameKh} onChange={(e) => setNameKh(e.target.value)} placeholder={t('user_namekh_placeholder')} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground block font-sans">
            {t('user_email_label')} *
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('user_email_placeholder')}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground block font-sans">
              {t('phone_label')}
            </label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phone_placeholder')} className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground block font-sans">
              {t('position_label')}
            </label>
            <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder={t('position_placeholder')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground block font-sans">
            {t('preferred_lang_label')}
          </label>
          <select
            value={preferredLang}
            onChange={(e) => setPreferredLang(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-card px-4 font-sans text-sm focus:border-primary focus:outline-none"
          >
            <option value="">{t('lang_default')}</option>
            <option value="en">{t('lang_en')}</option>
            <option value="km">{t('lang_kh')}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground block font-sans">
            {t('user_password_label')} *
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
          <label className="text-xs font-medium text-muted-foreground block font-sans">
            {t('user_role_label')} *
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

        <BuildingPicker
          properties={properties}
          selected={propertyIds}
          onToggle={toggleProperty}
          lang={lang}
        />

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
