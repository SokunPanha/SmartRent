'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from './Modal';
import { ModalHeader } from './ModalHeader';
import { ModalFooter } from './ModalFooter';
import { Input } from '@/components/ui/input';

/**
 * Re-auth gate: prompts for the current user's password before a sensitive
 * action is applied. The password is passed back to the caller, which sends it
 * to the server for verification; `error` surfaces a wrong-password message
 * without closing the modal.
 */
export function PasswordConfirmModal({
  open,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (password: string) => void;
}) {
  const t = useTranslations('Settings');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password) onConfirm(password);
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader title={t('confirm_password_title')} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <p className="font-sans text-xs text-muted-foreground">{t('confirm_password_desc')}</p>
        <div className="space-y-1.5">
          <label className="block font-sans text-xs font-medium text-muted-foreground">
            {t('password_label')}
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            required
          />
          {error && <p className="font-sans text-[11px] text-destructive">{error}</p>}
        </div>
        <ModalFooter
          cancelLabel={t('cancel')}
          onCancel={onClose}
          submitLabel={t('confirm')}
          submitDisabled={busy || !password}
        />
      </form>
    </Modal>
  );
}
