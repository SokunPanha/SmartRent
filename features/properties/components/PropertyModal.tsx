import { X } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { usePropertiesController } from '../use-properties-controller';

type Controller = ReturnType<typeof usePropertiesController>;

export function PropertyModal({
  c,
  t,
  lang,
}: {
  c: Controller;
  t: any;
  lang: AppLanguage;
}) {
  return (
    <Modal open={c.showPropModal} onClose={c.closePropModal} size="md">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-bold text-foreground text-base font-sans">{t.add_property}</h3>
        <button
          onClick={c.closePropModal}
          className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-muted-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

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
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-emerald-500 focus:outline-none"
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
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              {t.property_type} *
            </label>
            <select
              value={c.propType}
              onChange={(e) => c.setPropType(e.target.value as typeof c.propType)}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-emerald-500 focus:outline-none bg-card font-sans"
            >
              <option value="apartment">Apartment / អាផាតមិន</option>
              <option value="borey">Borey (Villa/Flat) / បុរី</option>
              <option value="condo">Condominium / ខុនដូ</option>
              <option value="guesthouse">Guesthouse / ផ្ទះសំណាក់</option>
            </select>
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
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-emerald-500 focus:outline-none"
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
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={c.closePropModal}
            className="flex-1 py-2 rounded-lg text-sm border border-border hover:bg-muted transition cursor-pointer font-sans"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition font-semibold cursor-pointer font-sans"
          >
            {t.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
