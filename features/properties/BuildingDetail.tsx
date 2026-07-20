'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, MapPin, Trash2 } from 'lucide-react';
import { Property, Room, UserRole, AppLanguage } from '@/lib/types';
import { PermissionBanner } from '@/components/shared/PermissionBanner';
import { useCan } from '@/features/admin/permissions.queries';
import { pickLocale } from '@/lib/i18n';
import { useRoomsController } from './use-rooms-controller';
import { RoomTable } from './components/RoomTable';
import { RoomModal } from './components/RoomModal';

type PropType = 'apartment' | 'borey' | 'condo' | 'guesthouse';

function typeLabel(type: PropType, t: (k: string) => string): string {
  switch (type) {
    case 'borey':
      return t('type_borey');
    case 'condo':
      return t('type_condo');
    case 'guesthouse':
      return t('type_guesthouse');
    default:
      return t('type_apartment');
  }
}

interface BuildingDetailProps {
  property: Property;
  rooms: Room[];
  activeRole: UserRole;
  lang: AppLanguage;
  onAddRoom: (room: Room) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onDeleteProperty: (propId: string) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** Per-building page: header + summary stats + the room table. */
export default function BuildingDetail({
  property,
  rooms,
  activeRole,
  lang,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onDeleteProperty,
  logAction,
}: BuildingDetailProps) {
  const t = useTranslations('Properties');
  const router = useRouter();
  const can = useCan();
  const canModify = can('properties.manage');

  const c = useRoomsController({
    property,
    rooms,
    canModify,
    onAddRoom,
    onUpdateRoom,
    onDeleteRoom,
    onDeleteProperty,
    logAction,
    onBuildingDeleted: () => router.push('/properties'),
  });

  return (
    <div className="space-y-6" id="building-detail-container">
      <Link
        href="/properties"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back_to_buildings')}
      </Link>

      {!canModify && (
        <PermissionBanner message={t('cannot_modify_persona', { role: activeRole.toUpperCase() })} />
      )}

      <div className="bg-card border border-border rounded-xl shadow-3xs p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-5">
        <div>
          <span className="text-[11px] font-semibold tracking-wide bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-sans">
            {typeLabel(property.type, t)}
          </span>
          <h2 className="text-xl font-bold text-foreground tracking-tight font-sans mt-3">
            {pickLocale(lang, property.name, property.nameKh)}
          </h2>
          <p className="text-xs text-muted-foreground flex items-start gap-1 mt-2 font-sans">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {pickLocale(lang, property.address, property.addressKh)}
          </p>
        </div>

        <div className="flex items-end gap-6">
          <div className="flex gap-6">
            <div>
              <div className="text-2xl font-bold text-foreground tabular-nums font-sans">
                {c.propertyRooms.length}
              </div>
              <div className="text-xs text-muted-foreground font-sans">{t('total_rooms_label')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary tabular-nums font-sans">
                {c.occupiedCount}
              </div>
              <div className="text-xs text-muted-foreground font-sans">{t('occupied')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground tabular-nums font-sans">
                {c.vacantCount}
              </div>
              <div className="text-xs text-muted-foreground font-sans">{t('vacant')}</div>
            </div>
          </div>
        </div>
      </div>

      <RoomTable
        rooms={c.filteredRooms}
        statusFilter={c.roomStatusFilter}
        onStatusFilterChange={c.setRoomStatusFilter}
        canModify={canModify}
        onAddRoom={c.openRoomModalForCreate}
        onEditRoom={c.handleEditRoomClick}
        onDeleteRoom={c.handleDeleteRoomClick}
      />

      {canModify && (
        <div className="flex justify-end">
          <button
            onClick={c.handleDeleteBuilding}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 rounded-lg transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('delete_building')}
          </button>
        </div>
      )}

      <RoomModal c={c} lang={lang} />
    </div>
  );
}
