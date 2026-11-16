import { useTranslations } from 'next-intl';
import { AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoomsController } from '../use-rooms-controller';

type Controller = ReturnType<typeof useRoomsController>;

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
      <ModalHeader title={c.editingRoomId ? t('edit_room') : t('add_room')} onClose={c.closeRoomModal} />

      <form onSubmit={c.handleCreateOrUpdateRoom} className="p-4 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
              {t('room_number')} *
            </label>
            <input
              type="text"
              value={c.roomNumber}
              onChange={(e) => c.setRoomNumber(e.target.value)}
              placeholder={t('room_number_placeholder')}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:border-primary focus:outline-none font-mono font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
                {t('floor')} *
              </label>
              <input
                type="number"
                value={c.roomFloor}
                onChange={(e) => c.setRoomFloor(Number(e.target.value))}
                min={1}
                max={40}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
                {t('room_rent_label')} *
              </label>
              <input
                type="number"
                value={c.roomRent}
                onChange={(e) => c.setRoomRent(Number(e.target.value))}
                min={1}
                max={10000}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:border-primary focus:outline-none font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1 font-sans">
              {tCommon('status')} *
            </label>
            {c.roomStatus === 'occupied' ? (
              // Occupancy comes from the lease; end it with Move out instead.
              <p className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                {t('occupied')} — {t('occupied_by_lease_hint')}
              </p>
            ) : (
              <Select
                value={c.roomStatus}
                onValueChange={(v) => c.setRoomStatus(v as typeof c.roomStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">{t('vacant')}</SelectItem>
                  <SelectItem value="maintenance">{t('maintenance')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <ModalFooter cancelLabel={tCommon('cancel')} onCancel={c.closeRoomModal} submitLabel={tCommon('save')} />
      </form>
    </Modal>
  );
}
