import { X, Lightbulb, Droplet } from 'lucide-react';
import { Room, Property, AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
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
  t,
  lang,
}: {
  form: ReadingForm;
  rooms: Room[];
  properties: Property[];
  monthNames: MonthOption[];
  t: any;
  lang: AppLanguage;
}) {
  return (
    <Modal open={form.showModal} onClose={form.closeModal} size="sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-bold text-foreground text-base font-sans">{t.record_reading}</h3>
        <button
          onClick={form.closeModal}
          className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-muted-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={form.submit} className="p-4 space-y-4 text-xs">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              Room Number *
            </label>
            <select
              value={form.targetRoomId}
              onChange={(e) => form.handleRoomSelectionChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-chart-2 focus:outline-none bg-card font-sans font-semibold"
              required
            >
              <option value="" disabled>
                {lang === 'en' ? '-- Select a Room --' : '-- ជ្រើសរើសបន្ទប់ --'}
              </option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {getRoomNumber(rooms, r.id)} ({getPropertyName(rooms, properties, r.id, lang)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                Billing Month *
              </label>
              <select
                value={form.readingMonth}
                onChange={(e) => form.setReadingMonth(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-xs focus:border-chart-2 focus:outline-none bg-card font-sans"
              >
                {monthNames.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                Billing Year *
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
              Electricity Level Entry (kWh)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-chart-1 uppercase block mb-1 font-sans">Previous</label>
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
                <label className="text-[9px] font-bold text-chart-1 uppercase block mb-1 font-sans">Current Level *</label>
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
              Water Level Entry (m³)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-info uppercase block mb-1 font-sans">Previous</label>
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
                <label className="text-[9px] font-bold text-info uppercase block mb-1 font-sans">Current Level *</label>
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

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={form.closeModal}
            className="flex-1 py-2 rounded-lg text-sm border border-border hover:bg-muted transition cursor-pointer font-sans"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg text-sm bg-chart-2 hover:bg-chart-2/90 text-white transition font-semibold cursor-pointer font-sans"
          >
            {t.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
