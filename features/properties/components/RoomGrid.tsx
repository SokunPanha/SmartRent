import { useTranslations } from 'next-intl';
import { Plus, Edit3, Grid } from 'lucide-react';
import { Property, Room, AppLanguage } from '@/lib/types';
import { StatusBadge, StatusBadgeTone } from '@/components/shared/StatusBadge';
import { DeleteButton } from '@/components/shared/DeleteButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { pickLocale } from '@/lib/i18n';

export function RoomGrid({
  activeProperty,
  activeRooms,
  canModify,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  lang,
}: {
  activeProperty?: Property;
  activeRooms: Room[];
  canModify: boolean;
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string, roomNumber: string) => void;
  lang: AppLanguage;
}) {
  const t = useTranslations('Properties');
  const tCommon = useTranslations('Common');
  return (
    <div className="md:col-span-2 space-y-4">
      {activeProperty ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-3xs">
            <div>
              <h3 className="font-bold text-foreground text-base font-sans">
                {t('rooms_for')} &quot;{pickLocale(lang, activeProperty.name, activeProperty.nameKh)}&quot;
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-sans">
                {activeRooms.length}{' '}
                {t('rooms_configured')}
              </p>
            </div>
            {canModify && (
              <button
                onClick={onAddRoom}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer self-stretch sm:self-auto justify-center"
                id="open-add-room-modal"
              >
                <Plus className="w-4 h-4" />
                {t('add_room')}
              </button>
            )}
          </div>

          {activeRooms.length === 0 ? (
            <EmptyState
              icon={Grid}
              title={t('no_rooms_listed')}
              className="p-12 shadow-xs"
              action={
                canModify && (
                  <button
                    onClick={onAddRoom}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('add_room')}
                  </button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="rooms-grid-layout">
              {activeRooms.map((room) => {
                let statusTone: StatusBadgeTone = 'info';
                let statusLabel = t('vacant');
                if (room.status === 'occupied') {
                  statusTone = 'success';
                  statusLabel = t('occupied');
                } else if (room.status === 'maintenance') {
                  statusTone = 'warning';
                  statusLabel = t('maintenance');
                }

                return (
                  <div
                    key={room.id}
                    className="bg-card border border-border rounded-xl p-4 shadow-3xs flex flex-col justify-between hover:border-border transition"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {t('floor')} {room.floor}
                        </span>
                        <h5 className="font-sans font-bold text-foreground text-base mt-0.5">
                          {room.roomNumber}
                        </h5>
                      </div>
                      <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground block tracking-wider uppercase font-sans">
                          {t('rent_rate')}
                        </span>
                        <span className="text-sm font-bold text-foreground font-mono">
                          ${room.rentAmount}{' '}
                          <span className="text-xs text-muted-foreground font-sans font-normal">/mo</span>
                        </span>
                      </div>

                      {canModify && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onEditRoom(room)}
                            className="p-1.5 bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border rounded-lg transition cursor-pointer"
                            title={tCommon('edit')}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <DeleteButton
                            onClick={() => onDeleteRoom(room.id, room.roomNumber)}
                            title={tCommon('delete')}
                            className="p-1.5 bg-muted border border-border rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <EmptyState title={t('no_property_selected')} className="p-12 shadow-xs" />
      )}
    </div>
  );
}
