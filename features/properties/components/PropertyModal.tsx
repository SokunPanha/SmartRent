import { useTranslations } from 'next-intl';
import { AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePropertiesController } from '../use-properties-controller';

type Controller = ReturnType<typeof usePropertiesController>;

export function PropertyModal({
  c,
  lang,
}: {
  c: Controller;
  lang: AppLanguage;
}) {
  const t = useTranslations('Properties');
  const tCommon = useTranslations('Common');
  return (
    <Modal open={c.showPropModal} onClose={c.closePropModal} size="md">
      <ModalHeader title={t('add_property')} onClose={c.closePropModal} />

      <form onSubmit={c.handleCreateProp} className="p-4 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              Property Name (English) *
            </label>
            <input
              type="text"
              value={c.propName}
              onChange={(e) => c.setPropName(e.target.value)}
              placeholder="e.g. Sensok Cozy Apartment"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              ឈ្មោះអចលនទ្រព្យ (Khmer) *
            </label>
            <input
              type="text"
              value={c.propNameKh}
              onChange={(e) => c.setPropNameKh(e.target.value)}
              placeholder="ឧ. សែនសុខ ខូហ្ស៊ី អាផាតមិន"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              {t('property_type')} *
            </label>
            <Select
              value={c.propType}
              onValueChange={(v) => c.setPropType(v as typeof c.propType)}
            >
              <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-sm font-sans focus-visible:border-primary focus-visible:ring-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment / អាផាតមិន</SelectItem>
                <SelectItem value="borey">Borey (Villa/Flat) / បុរី</SelectItem>
                <SelectItem value="condo">Condominium / ខុនដូ</SelectItem>
                <SelectItem value="guesthouse">Guesthouse / ផ្ទះសំណាក់</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              Address (English) *
            </label>
            <input
              type="text"
              value={c.propAddress}
              onChange={(e) => c.setPropAddress(e.target.value)}
              placeholder="e.g. Street 1986, Sen Sok, Phnom Penh"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              អាសយដ្ឋាន (Khmer) *
            </label>
            <input
              type="text"
              value={c.propAddressKh}
              onChange={(e) => c.setPropAddressKh(e.target.value)}
              placeholder="ឧ. ផ្លូវ ១៩៨៦, ខណ្ឌសែនសុខ, ភ្នំពេញ"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
        </div>

        <ModalFooter cancelLabel={tCommon('cancel')} onCancel={c.closePropModal} submitLabel={tCommon('save')} />
      </form>
    </Modal>
  );
}
