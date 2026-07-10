import { Plus, Trash2, Edit3, Grid } from 'lucide-react';
import { Property, Room, AppLanguage } from '@/lib/types';

export function RoomGrid({
  activeProperty,
  activeRooms,
  canModify,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  t,
  lang,
}: {
  activeProperty?: Property;
  activeRooms: Room[];
  canModify: boolean;
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string, roomNumber: string) => void;
  t: any;
  lang: AppLanguage;
}) {
  return (
    <div className="md:col-span-2 space-y-4">
      {activeProperty ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-3xs">
            <div>
              <h3 className="font-bold text-foreground text-base font-sans">
                {t.rooms_for} &quot;{lang === 'en' ? activeProperty.name : activeProperty.nameKh}&quot;
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-sans">
                {activeRooms.length}{' '}
                {lang === 'en' ? 'rooms configured at this location' : 'បន្ទប់ជួលនៅក្នុងទីតាំងនេះ'}
              </p>
            </div>
            {canModify && (
              <button
                onClick={onAddRoom}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer self-stretch sm:self-auto justify-center"
                id="open-add-room-modal"
              >
                <Plus className="w-4 h-4" />
                {t.add_room}
              </button>
            )}
          </div>

          {activeRooms.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center shadow-xs">
              <Grid className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
              <p className="text-sm font-semibold text-muted-foreground mt-3 font-sans">
                {lang === 'en'
                  ? 'No rooms listed for this property.'
                  : 'មិនទាន់មានបន្ទប់សម្រាប់ទីតាំងនេះនៅឡើយទេ។'}
              </p>
              {canModify && (
                <button
                  onClick={onAddRoom}
                  className="mt-4 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.add_room}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="rooms-grid-layout">
              {activeRooms.map((room) => {
                let statusColor = 'bg-info/10 border-info/20 text-info';
                let statusLabel = t.vacant;
                if (room.status === 'occupied') {
                  statusColor = 'bg-chart-2/10 border-chart-2/20 text-chart-2';
                  statusLabel = t.occupied;
                } else if (room.status === 'maintenance') {
                  statusColor = 'bg-chart-1/10 border-chart-1/20 text-chart-1';
                  statusLabel = lang === 'en' ? 'Maintenance' : 'កំពុងជួសជុល';
                }

                return (
                  <div
                    key={room.id}
                    className="bg-card border border-border rounded-xl p-4 shadow-3xs flex flex-col justify-between hover:border-border transition"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {t.floor} {room.floor}
                        </span>
                        <h5 className="font-sans font-bold text-foreground text-base mt-0.5">
                          {room.roomNumber}
                        </h5>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground block tracking-wider uppercase font-sans">
                          {t.rent_rate}
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
                            title={t.edit}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRoom(room.id, room.roomNumber)}
                            className="p-1.5 bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border rounded-lg transition cursor-pointer"
                            title={t.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-xs">
          <p className="text-muted-foreground text-sm font-sans italic">
            {lang === 'en'
              ? 'Please create at least one Property location to inspect or configuration rooms.'
              : 'សូមបង្កើតទីតាំងអចលនទ្រព្យជាមុនសិន។'}
          </p>
        </div>
      )}
    </div>
  );
}
