'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Property, Room } from '@/lib/types';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';

type RoomStatus = 'vacant' | 'occupied' | 'maintenance';

interface Args {
  property: Property | undefined;
  rooms: Room[];
  canModify: boolean;
  onAddRoom: (room: Room) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onDeleteProperty: (propId: string) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
  /** Called after the building itself is deleted, so the page can navigate away. */
  onBuildingDeleted: () => void;
}

/** Owns everything on a single building's page: its room list + filter, the
 *  room create/edit modal, and deleting the building. */
export function useRoomsController({
  property,
  rooms,
  canModify,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onDeleteProperty,
  logAction,
  onBuildingDeleted,
}: Args) {
  const t = useTranslations('Properties');
  const tCommon = useTranslations('Common');
  const confirm = useConfirm();

  const propId = property?.id ?? '';

  const propertyRooms = useMemo(
    () => rooms.filter((r) => r.propertyId === propId),
    [rooms, propId]
  );

  const occupiedCount = propertyRooms.filter((r) => r.status === 'occupied').length;
  const vacantCount = propertyRooms.filter((r) => r.status === 'vacant').length;

  const [roomStatusFilter, setRoomStatusFilter] = useState<'all' | RoomStatus>('all');
  const filteredRooms = useMemo(
    () =>
      roomStatusFilter === 'all'
        ? propertyRooms
        : propertyRooms.filter((r) => r.status === roomStatusFilter),
    [propertyRooms, roomStatusFilter]
  );

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomFloor, setRoomFloor] = useState(1);
  const [roomRent, setRoomRent] = useState(200);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('vacant');

  function openRoomModalForCreate() {
    setEditingRoomId(null);
    setRoomNumber('');
    setRoomFloor(1);
    setRoomRent(200);
    setRoomStatus('vacant');
    setShowRoomModal(true);
  }
  const closeRoomModal = () => setShowRoomModal(false);

  function handleCreateOrUpdateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    if (!roomNumber || !roomFloor || !roomRent) return toast.error(tCommon('please_fill'));

    const isDuplicate = rooms.some(
      (r) =>
        r.propertyId === propId &&
        r.roomNumber.toLowerCase() === roomNumber.toLowerCase() &&
        r.id !== editingRoomId
    );
    if (isDuplicate) {
      return toast.error(t('duplicate_room_number'));
    }

    if (editingRoomId) {
      onUpdateRoom({
        id: editingRoomId,
        propertyId: propId,
        roomNumber,
        floor: Number(roomFloor),
        rentAmount: Number(roomRent),
        status: roomStatus,
      });
      logAction(
        'Updated Room Details',
        'បានកែប្រែព័ត៌មានបន្ទប់',
        `Updated room ${roomNumber} in ${property?.name}`,
        `បានកែប្រែព័ត៌មានបន្ទប់ ${roomNumber} ក្នុងទីតាំង ${property?.nameKh}`
      );
    } else {
      onAddRoom({
        id: 'room-' + Date.now(),
        propertyId: propId,
        roomNumber,
        floor: Number(roomFloor),
        rentAmount: Number(roomRent),
        status: roomStatus,
      });
      logAction(
        'Created Room',
        'បានបង្កើតបន្ទប់ថ្មី',
        `Created room ${roomNumber} with base rent $${roomRent} in ${property?.name}`,
        `បានបង្កើតបន្ទប់លេខ ${roomNumber} តម្លៃមូលដ្ឋាន $${roomRent} ក្នុងទីតាំង ${property?.nameKh}`
      );
    }

    setEditingRoomId(null);
    setShowRoomModal(false);
  }

  function handleEditRoomClick(room: Room) {
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    setEditingRoomId(room.id);
    setRoomNumber(room.roomNumber);
    setRoomFloor(room.floor);
    setRoomRent(room.rentAmount);
    setRoomStatus(room.status);
    setShowRoomModal(true);
  }

  async function handleDeleteRoomClick(roomId: string, rNumber: string) {
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    const ok = await confirm({
      title: tCommon('confirm_delete'),
      confirmLabel: tCommon('delete'),
      variant: 'destructive',
    });
    if (ok) {
      onDeleteRoom(roomId);
      logAction(
        'Deleted Room',
        'បានលុបបន្ទប់',
        `Removed room ${rNumber} from property ${property?.name}`,
        `បានលុបបន្ទប់ជួលលេខ ${rNumber} ចេញពីទីតាំង ${property?.nameKh}`
      );
    }
  }

  async function handleDeleteBuilding() {
    if (!canModify || !property) return toast.error(tCommon('insufficient_permissions'));
    if (propertyRooms.length > 0) {
      return toast.error(t('cannot_delete_property_with_rooms', { count: propertyRooms.length }));
    }
    const ok = await confirm({
      title: tCommon('confirm_delete'),
      confirmLabel: tCommon('delete'),
      variant: 'destructive',
    });
    if (ok) {
      onDeleteProperty(property.id);
      logAction(
        'Deleted Property Location',
        'បានលុបទីតាំងផ្ទះជួល',
        `Deleted property location "${property.name}"`,
        `បានលុបចោលទាំងស្រុងនូវទីតាំងផ្ទះជួលឈ្មោះ "${property.nameKh}"`
      );
      onBuildingDeleted();
    }
  }

  return {
    propertyRooms,
    filteredRooms,
    occupiedCount,
    vacantCount,
    roomStatusFilter,
    setRoomStatusFilter,
    // room modal (consumed by RoomModal)
    showRoomModal,
    openRoomModalForCreate,
    closeRoomModal,
    editingRoomId,
    roomNumber,
    setRoomNumber,
    roomFloor,
    setRoomFloor,
    roomRent,
    setRoomRent,
    roomStatus,
    setRoomStatus,
    handleCreateOrUpdateRoom,
    handleEditRoomClick,
    handleDeleteRoomClick,
    handleDeleteBuilding,
  };
}
