import { X } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { usePropertiesController } from '../use-properties-controller';

type Controller = ReturnType<typeof usePropertiesController>;

export function RoomModal({
  c,
  t,
  lang,
}: {
  c: Controller;
  t: any;
  lang: AppLanguage;
}) {
  return (
    <Modal open={c.showRoomModal} onClose={c.closeRoomModal} size="sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-bold text-foreground text-base font-sans">
          {c.editingRoomId ? (lang === 'en' ? 'Edit Room' : 'កែប្រែបញ្ជីបន្ទប់') : t.add_room}
        </h3>
        <button
          onClick={c.closeRoomModal}
          className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-muted-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={c.handleCreateOrUpdateRoom} className="p-4 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              {t.room_number} *
            </label>
            <input
              type="text"
              value={c.roomNumber}
              onChange={(e) => c.setRoomNumber(e.target.value)}
              placeholder="e.g. A-101, E-04"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none font-mono font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                {lang === 'en' ? 'Floor' : 'ជាន់ទី'} *
              </label>
              <input
                type="number"
                value={c.roomFloor}
                onChange={(e) => c.setRoomFloor(Number(e.target.value))}
                min={1}
                max={40}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
                Rent Amount (USD) *
              </label>
              <input
                type="number"
                value={c.roomRent}
                onChange={(e) => c.setRoomRent(Number(e.target.value))}
                min={1}
                max={10000}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              {t.status} *
            </label>
            <select
              value={c.roomStatus}
              onChange={(e) => c.setRoomStatus(e.target.value as typeof c.roomStatus)}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-primary focus:outline-none bg-card font-sans"
            >
              <option value="vacant">{t.vacant}</option>
              <option value="occupied">{t.occupied}</option>
              <option value="maintenance">{lang === 'en' ? 'Under Maintenance' : 'កំពុងជួសជុល'}</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={c.closeRoomModal}
            className="flex-1 py-2 rounded-lg text-sm border border-border hover:bg-muted transition cursor-pointer font-sans"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition font-semibold cursor-pointer font-sans"
          >
            {t.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
