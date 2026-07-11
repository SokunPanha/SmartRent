import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePropertiesController } from '../use-properties-controller';

type Controller = ReturnType<typeof usePropertiesController>;

export function RoomModal({
  c,
  lang,
}: {
  c: Controller;
  lang: AppLanguage;
}) {
  const t = useTranslations('Properties');
  const tCommon = useTranslations('Common');
  return (
    <Modal open={c.showRoomModal} onClose={c.closeRoomModal} size="sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-bold text-foreground text-base font-sans">
          {c.editingRoomId ? t('edit_room') : t('add_room')}
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
              {t('room_number')} *
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
                {t('floor')} *
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
              {tCommon('status')} *
            </label>
            <Select
              value={c.roomStatus}
              onValueChange={(v) => c.setRoomStatus(v as typeof c.roomStatus)}
            >
              <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-sm font-sans focus-visible:border-primary focus-visible:ring-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacant">{t('vacant')}</SelectItem>
                <SelectItem value="occupied">{t('occupied')}</SelectItem>
                <SelectItem value="maintenance">{t('maintenance')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={c.closeRoomModal}
            className="flex-1 py-2 rounded-lg text-sm border border-border hover:bg-muted transition cursor-pointer font-sans"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition font-semibold cursor-pointer font-sans"
          >
            {tCommon('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
