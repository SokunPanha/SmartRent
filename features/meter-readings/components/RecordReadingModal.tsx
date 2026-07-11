import { Lightbulb, Droplet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Room, Property, AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MonthOption,
  getRoomNumber,
  getPropertyName,
} from '../meter-readings.helpers';
import { useReadingForm } from '../use-reading-form';

type ReadingForm = ReturnType<typeof useReadingForm>;

export function RecordReadingModal({
  form,
  rooms,
  properties,
  monthNames,
  lang,
}: {
  form: ReadingForm;
  rooms: Room[];
  properties: Property[];
  monthNames: MonthOption[];
  lang: AppLanguage;
}) {
  const t = useTranslations('MeterReadings');
  const tCommon = useTranslations('Common');
  return (
    <Modal open={form.showModal} onClose={form.closeModal} size="sm">
      <ModalHeader title={t('record_reading')} onClose={form.closeModal} />

      <form onSubmit={form.submit} className="p-4 space-y-4 text-xs">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              {t('room_number_required')}
            </label>
            <Select value={form.targetRoomId} onValueChange={form.handleRoomSelectionChange}>
              <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-sm font-sans font-semibold focus-visible:border-chart-2 focus-visible:ring-chart-2/30">
                <SelectValue placeholder={t('select_room_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {getRoomNumber(rooms, r.id)} ({getPropertyName(rooms, properties, r.id, lang)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                {t('billing_month_required')}
              </label>
              <Select
                value={String(form.readingMonth)}
                onValueChange={(v) => form.setReadingMonth(Number(v))}
              >
                <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-xs font-sans focus-visible:border-chart-2 focus-visible:ring-chart-2/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                {t('billing_year_required')}
              </label>
              <input
                type="number"
                value={form.readingYear}
                onChange={(e) => form.setReadingYear(Number(e.target.value))}
                min={2020}
                max={2040}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-xs focus:border-chart-2 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-chart-1/10 border border-chart-1/20 rounded-xl space-y-3">
            <h4 className="text-[10px] font-bold text-chart-1 uppercase tracking-wider font-sans flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" />
              {t('electricity_entry')}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-chart-1 uppercase block mb-1 font-sans">{t('previous')}</label>
                <input
                  type="number"
                  value={form.prevElec}
                  onChange={(e) => form.setPrevElec(Number(e.target.value))}
                  min={0}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-chart-1/30 text-xs focus:outline-none font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-chart-1 uppercase block mb-1 font-sans">{t('current_level_required')}</label>
                <input
                  type="number"
                  value={form.currElec}
                  onChange={(e) => form.setCurrElec(Number(e.target.value))}
                  min={form.prevElec}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-chart-1/30 text-xs focus:outline-none font-mono font-bold focus:ring-1 focus:ring-chart-1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-info/10 border border-info/20 rounded-xl space-y-3">
            <h4 className="text-[10px] font-bold text-info uppercase tracking-wider font-sans flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5" />
              {t('water_entry')}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-info uppercase block mb-1 font-sans">{t('previous')}</label>
                <input
                  type="number"
                  value={form.prevWater}
                  onChange={(e) => form.setPrevWater(Number(e.target.value))}
                  min={0}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-info/30 text-xs focus:outline-none font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-info uppercase block mb-1 font-sans">{t('current_level_required')}</label>
                <input
                  type="number"
                  value={form.currWater}
                  onChange={(e) => form.setCurrWater(Number(e.target.value))}
                  min={form.prevWater}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-info/30 text-xs focus:outline-none font-mono font-bold focus:ring-1 focus:ring-info"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <ModalFooter
          cancelLabel={tCommon('cancel')}
          onCancel={form.closeModal}
          submitLabel={tCommon('save')}
          tone="success"
        />
      </form>
    </Modal>
  );
}
