'use client';

import { useTranslations } from 'next-intl';
import { Property, Room, UserRole, AppLanguage } from '@/lib/types';
import { PermissionBanner } from '@/components/shared/PermissionBanner';
import { useCan } from '@/features/admin/permissions.queries';
import { usePropertiesController } from './use-properties-controller';
import { PropertyList } from './components/PropertyList';
import { RoomGrid } from './components/RoomGrid';
import { PropertyModal } from './components/PropertyModal';
import { RoomModal } from './components/RoomModal';

interface PropertiesRoomsProps {
  properties: Property[];
  rooms: Room[];
  activeRole: UserRole;
  lang: AppLanguage;
  onAddProperty: (prop: Omit<Property, 'totalRooms'>) => void;
  onAddRoom: (room: Room) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onDeleteProperty: (propId: string) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

export default function PropertiesRooms({
  properties,
  rooms,
  activeRole,
  lang,
  onAddProperty,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onDeleteProperty,
  logAction,
}: PropertiesRoomsProps) {
  const t = useTranslations('Properties');
  const can = useCan();
  const canModify = can('properties.manage');

  const c = usePropertiesController({
    properties,
    rooms,
    canModify,
    lang,
    onAddProperty,
    onAddRoom,
    onUpdateRoom,
    onDeleteRoom,
    onDeleteProperty,
    logAction,
  });

  return (
    <div className="space-y-6" id="properties-rooms-container">
      {!canModify && (
        <PermissionBanner
          message={t('cannot_modify_persona', { role: activeRole.toUpperCase() })}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PropertyList
          properties={properties}
          rooms={rooms}
          selectedPropId={c.selectedPropId}
          onSelect={c.setSelectedPropId}
          canModify={canModify}
          onAddClick={c.openPropModal}
          onDeleteProp={c.handleDeletePropClick}
          lang={lang}
        />
        <RoomGrid
          activeProperty={c.activeProperty}
          activeRooms={c.activeRooms}
          canModify={canModify}
          onAddRoom={c.openRoomModalForCreate}
          onEditRoom={c.handleEditRoomClick}
          onDeleteRoom={c.handleDeleteRoomClick}
          lang={lang}
        />
      </div>

      <PropertyModal c={c} lang={lang} />
      <RoomModal c={c} lang={lang} />
    </div>
  );
}
