import { Lightbulb, Droplet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Room, Property, AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonthOption } from '../meter-readings.helpers';
import { useReadingForm } from '../use-reading-form';
import { RoomSearchSelect } from './RoomSearchSelect';

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
      <ModalHeader title={form.editing ? t('edit_reading') : t('record_reading')} onClose={form.closeModal} />

      <form onSubmit={form.submit} className="p-4 space-y-4 text-xs">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
              {t('room_number_required')}
            </label>
            <RoomSearchSelect
              disabled={form.editing}
              rooms={rooms}
              properties={properties}
              value={form.targetRoomId}
              onChange={form.handleRoomSelectionChange}
              lang={lang}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
                {t('billing_month_required')}
              </label>
              <Select
                disabled={form.editing}
                value={String(form.readingMonth)}
                onValueChange={(v) => form.setReadingMonth(Number(v))}
              >
                <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-xs font-sans focus-visible:border-primary focus-visible:ring-primary/30">
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
              <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
                {t('billing_year_required')}
              </label>
              <input
                type="number"
                value={form.readingYear}
                disabled={form.editing}
                onChange={(e) => form.setReadingYear(Number(e.target.value))}
                min={2020}
                max={2040}
                className="w-full px-4 py-3 rounded-xl border border-border text-xs focus:border-primary focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-chart-1/10 border border-chart-1/20 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-chart-1 font-sans flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" />
              {t('electricity_entry')}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-chart-1 block mb-1 font-sans">{t('previous')}</label>
                <input
                  type="number"
                  value={form.prevElec}
                  onChange={(e) => form.setPrevElec(Number(e.target.value))}
                  min={0}
                  readOnly={form.prevLocked}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-chart-1/30 text-xs focus:outline-none font-mono font-bold read-only:bg-muted read-only:text-muted-foreground"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-chart-1 block mb-1 font-sans">{t('current_level_required')}</label>
                <input
                  type="number"
                  value={form.currElec}
                  onChange={(e) => form.setCurrElec(Number(e.target.value))}
                  min={form.prevElec}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-chart-1/30 text-xs focus:outline-none font-mono font-bold focus:ring-1 focus:ring-chart-1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-info/10 border border-info/20 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-info font-sans flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5" />
              {t('water_entry')}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-info block mb-1 font-sans">{t('previous')}</label>
                <input
                  type="number"
                  value={form.prevWater}
                  onChange={(e) => form.setPrevWater(Number(e.target.value))}
                  min={0}
                  readOnly={form.prevLocked}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-info/30 text-xs focus:outline-none font-mono font-bold read-only:bg-muted read-only:text-muted-foreground"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-info block mb-1 font-sans">{t('current_level_required')}</label>
                <input
                  type="number"
                  value={form.currWater}
                  onChange={(e) => form.setCurrWater(Number(e.target.value))}
                  min={form.prevWater}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-info/30 text-xs focus:outline-none font-mono font-bold focus:ring-1 focus:ring-info"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-border p-3">
          {form.priorPeriod && (
            <p className="text-[11px] text-muted-foreground">{t('prev_from_period', { period: form.priorPeriod })}</p>
          )}
          <label className="flex items-start gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={form.meterReplaced}
              onChange={(e) => form.setMeterReplaced(e.target.checked)}
              className="mt-0.5 size-4"
            />
            <span>
              {t('meter_replaced')}
              <span className="block text-[11px] text-muted-foreground">{t('meter_replaced_help')}</span>
            </span>
          </label>
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
