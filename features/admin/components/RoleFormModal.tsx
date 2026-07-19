'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { Input } from '@/components/ui/input';
import { PermissionKey } from '@/lib/permissions';
import { NewRoleInput } from '../roles.api';
import { PermissionChecklist } from './PermissionChecklist';

/** Two-step create wizard: step 1 role info, step 2 permissions. */
export function RoleFormModal({
  busy,
  onClose,
  onSubmit,
}: {
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: NewRoleInput) => void;
}) {
  const t = useTranslations('Admin');
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [perms, setPerms] = useState<Set<PermissionKey>>(new Set());

  const nameValid = name.trim().length > 0;

  const toggle = (key: PermissionKey) =>
    setPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  function handleCreate() {
    if (!nameValid) return;
    onSubmit({ name: name.trim(), description: description.trim() || undefined, permissions: [...perms] });
  }

  return (
    <Modal open onClose={onClose} size="sm">
      <ModalHeader title={t('create_role_title')} onClose={onClose} />

      <div className="flex items-center gap-2 px-4 pt-3">
        <StepDot n={1} label={t('step_info')} active={step === 1} done={step > 1} />
        <div className="h-px flex-1 bg-border" />
        <StepDot n={2} label={t('step_permissions')} active={step === 2} done={false} />
      </div>

      <div className="space-y-4 p-4">
        {step === 1 ? (
          <>
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-medium text-muted-foreground">
                {t('role_name')} *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('new_role_placeholder')}
                autoFocus
              />
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
                className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-sm border border-border py-2 font-sans text-sm transition hover:bg-muted cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={!nameValid}
                onClick={() => setStep(2)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 cursor-pointer disabled:opacity-40"
              >
                {t('next')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <PermissionChecklist selected={perms} onToggle={toggle} />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm border border-border py-2 font-sans text-sm transition hover:bg-muted cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('back')}
              </button>
              <button
                type="button"
                disabled={busy || !nameValid}
                onClick={handleCreate}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 cursor-pointer disabled:opacity-40"
              >
                <Check className="h-4 w-4" />
                {t('create_role_action')}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  const on = active || done;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${on ? 'text-primary' : 'text-muted-foreground'}`}>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
      >
        {n}
      </span>
      {label}
    </span>
  );
}
