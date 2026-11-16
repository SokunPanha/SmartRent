import { useTranslations } from 'next-intl';
import { AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { useTenantsController } from '../use-tenants-controller';
import { NationalIdUpload } from './NationalIdUpload';

type Controller = ReturnType<typeof useTenantsController>;

export function TenantModal({ c, lang }: { c: Controller; lang: AppLanguage }) {
  const t = useTranslations('Tenants');
  const tCommon = useTranslations('Common');
  return (
    <Modal open={c.showTenantModal} onClose={c.closeTenantModal} size="sm">
      <ModalHeader title={t('add_tenant')} onClose={c.closeTenantModal} />

      <form onSubmit={c.handleCreateTenant} className="p-4 space-y-4">
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
              {t('tenant_name_en_label')} *
            </label>
            <input
              type="text"
              value={c.tenantName}
              onChange={(e) => c.setTenantName(e.target.value)}
              placeholder={t('tenant_name_placeholder')}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
              {t('tenant_name_kh_label')} *
            </label>
            <input
              type="text"
              value={c.tenantNameKh}
              onChange={(e) => c.setTenantNameKh(e.target.value)}
              placeholder={t('tenant_name_kh_placeholder')}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
                {t('phone')} *
              </label>
              <input
                type="text"
                value={c.tenantPhone}
                onChange={(e) => c.setTenantPhone(e.target.value)}
                placeholder={t('phone_placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:border-primary focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
                {t('national_id')} *
              </label>
              <input
                type="text"
                value={c.tenantNID}
                onChange={(e) => c.setTenantNID(e.target.value)}
                placeholder={t('nid_placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:border-primary focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="max-w-xs">
              <NationalIdUpload
                label={`${t('id_card_photos')} *`}
                value={c.tenantIdBack}
                onChange={c.setTenantIdBack}
                onUploadingChange={c.setIdUploading}
                invalid={c.idImageTouched}
              />
            </div>
            {c.idImageTouched && !c.tenantIdBack && (
              <p className="text-xs font-medium text-destructive">{t('id_images_required')}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
              {t('tenant_email_label')}
            </label>
            <input
              type="email"
              value={c.tenantEmail}
              onChange={(e) => c.setTenantEmail(e.target.value)}
              placeholder={t('email_placeholder')}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:border-primary focus:outline-none font-mono"
            />
          </div>

          <div className="bg-info/10 p-3.5 rounded-xl border border-info/20 space-y-1.5">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={c.tenantTelegramAutoSend}
                onChange={(e) => c.setTenantTelegramAutoSend(e.target.checked)}
                className="rounded border-info/40 text-info focus:ring-info w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-info font-semibold">
                {t('auto_send_invoices')}
              </span>
            </label>
            <p className="text-[10px] text-info/80">
              {t('telegram_connect_hint')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
                {t('check_in')} *
              </label>
              <input
                type="date"
                value={c.tenantCheckIn}
                onChange={(e) => c.setTenantCheckIn(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-xs focus:border-primary focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
                {t('emergency_contact')}
              </label>
              <input
                type="text"
                value={c.tenantEmergency}
                onChange={(e) => c.setTenantEmergency(e.target.value)}
                placeholder={t('emergency_placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        <ModalFooter cancelLabel={tCommon('cancel')} onCancel={c.closeTenantModal} submitLabel={tCommon('save')} />
      </form>
    </Modal>
  );
}
