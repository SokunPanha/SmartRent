import { useTranslations } from 'next-intl';
import { Plus, Edit3, Grid } from 'lucide-react';
import { Room } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, StatusBadgeTone } from '@/components/shared/StatusBadge';
import { DeleteButton } from '@/components/shared/DeleteButton';
import { EmptyState } from '@/components/shared/EmptyState';

type RoomStatus = 'vacant' | 'occupied' | 'maintenance';

function statusMeta(status: RoomStatus, t: (k: string) => string): { tone: StatusBadgeTone; label: string } {
  if (status === 'occupied') return { tone: 'success', label: t('occupied') };
  if (status === 'maintenance') return { tone: 'warning', label: t('maintenance') };
  return { tone: 'info', label: t('vacant') };
}

/**
 * Rooms for a single building. Renders a hairline table on desktop/tablet and
 * the same rows as stacked cards on mobile (< sm), per DESIGN.md.
 */
export function RoomTable({
  rooms,
  statusFilter,
  onStatusFilterChange,
  canModify,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
}: {
  rooms: Room[];
  statusFilter: 'all' | RoomStatus;
  onStatusFilterChange: (status: 'all' | RoomStatus) => void;
  canModify: boolean;
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string, roomNumber: string) => void;
}) {
  const t = useTranslations('Properties');
  const tCommon = useTranslations('Common');

  return (
    <div className="bg-card border border-border rounded-xl shadow-3xs overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-foreground text-base font-sans">{t('rooms_heading')}</h3>
          <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
            <span className="text-muted-foreground font-sans">{t('status_filter_label')}</span>
            <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as 'all' | RoomStatus)}>
              <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_statuses')}</SelectItem>
                <SelectItem value="vacant">{t('vacant')}</SelectItem>
                <SelectItem value="occupied">{t('occupied')}</SelectItem>
                <SelectItem value="maintenance">{t('maintenance')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {canModify && (
          <button
            onClick={onAddRoom}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer shrink-0"
            id="open-add-room-modal"
          >
            <Plus className="w-4 h-4" />
            {t('add_room')}
          </button>
        )}
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          icon={Grid}
          title={t('no_rooms_listed')}
          className="p-12"
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
        <>
          {/* Desktop / tablet: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                    {t('room_number')}
                  </th>
                  <th className="text-right font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                    {t('floor')}
                  </th>
                  <th className="text-right font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                    {t('rent_per_month')}
                  </th>
                  <th className="text-left font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                    {tCommon('status')}
                  </th>
                  {canModify && (
                    <th className="text-right font-semibold text-muted-foreground text-xs px-4 py-3 font-sans">
                      {t('actions_label')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => {
                  const s = statusMeta(room.status, t);
                  return (
                    <tr key={room.id} className="border-b border-border/60 last:border-0 hover:bg-primary/[0.04] transition">
                      <td className="px-4 py-3.5 font-bold text-foreground font-sans">{room.roomNumber}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground font-mono">
                        {room.floor}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-mono font-bold text-foreground">
                        ${room.rentAmount}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                      </td>
                      {canModify && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 justify-end">
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
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: same rows as cards */}
          <div className="sm:hidden divide-y divide-border/60">
            {rooms.map((room) => {
              const s = statusMeta(room.status, t);
              return (
                <div key={room.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-foreground text-base font-sans">{room.roomNumber}</h5>
                      <span className="text-xs text-muted-foreground font-sans">
                        {t('floor')} {room.floor}
                      </span>
                    </div>
                    <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground font-mono">
                      ${room.rentAmount}
                      <span className="text-xs text-muted-foreground font-sans font-normal">/mo</span>
                    </span>
                    {canModify && (
                      <div className="flex items-center gap-1.5">
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
        </>
      )}
    </div>
  );
}
