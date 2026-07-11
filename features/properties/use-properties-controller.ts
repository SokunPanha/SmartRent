'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Property, Room, AppLanguage } from '@/lib/types';
import { useConfirm } from '@/components/shared/ConfirmDialogProvider';

type PropType = 'apartment' | 'borey' | 'condo' | 'guesthouse';
type RoomStatus = 'vacant' | 'occupied' | 'maintenance';

interface Args {
  properties: Property[];
  rooms: Room[];
  canModify: boolean;
  lang: AppLanguage;
  onAddProperty: (prop: Omit<Property, 'totalRooms'>) => void;
  onAddRoom: (room: Room) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onDeleteProperty: (propId: string) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** Owns all selection, modal and form state + CRUD handlers for the properties feature. */
export function usePropertiesController({
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
}: Args) {
  const t = useTranslations('Properties');
  const tCommon = useTranslations('Common');
  const confirm = useConfirm();
  const [selectedPropId, setSelectedPropId] = useState<string>(properties[0]?.id || '');

  const [showPropModal, setShowPropModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const [propName, setPropName] = useState('');
  const [propNameKh, setPropNameKh] = useState('');
  const [propType, setPropType] = useState<PropType>('apartment');
  const [propAddress, setPropAddress] = useState('');
  const [propAddressKh, setPropAddressKh] = useState('');

  const [roomNumber, setRoomNumber] = useState('');
  const [roomFloor, setRoomFloor] = useState(1);
  const [roomRent, setRoomRent] = useState(200);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('vacant');

  const activeProperty = properties.find((p) => p.id === selectedPropId) || properties[0];
  const activeRooms = rooms.filter((r) => r.propertyId === selectedPropId);

  function openPropModal() {
    setPropName('');
    setPropNameKh('');
    setPropAddress('');
    setPropAddressKh('');
    setShowPropModal(true);
  }
  const closePropModal = () => setShowPropModal(false);

  function openRoomModalForCreate() {
    setEditingRoomId(null);
    setRoomNumber('');
    setRoomFloor(1);
    setRoomRent(200);
    setRoomStatus('vacant');
    setShowRoomModal(true);
  }
  const closeRoomModal = () => setShowRoomModal(false);

  function handleCreateProp(e: React.FormEvent) {
    e.preventDefault();
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    if (!propName || !propNameKh || !propAddress || !propAddressKh) return toast.error(tCommon('please_fill'));

    const newId = 'prop-' + Date.now();
    onAddProperty({
      id: newId,
      name: propName,
      nameKh: propNameKh,
      type: propType,
      address: propAddress,
      addressKh: propAddressKh,
    });
    logAction(
      'Added Property',
      'បានបន្ថែមទីតាំងថ្មី',
      `Added property "${propName}" with type ${propType}`,
      `បានបង្កើតទីតាំងផ្ទះជួលថ្មីឈ្មោះ "${propNameKh}" ប្រភេទ ${propType}`
    );
    setPropName('');
    setPropNameKh('');
    setPropAddress('');
    setPropAddressKh('');
    setShowPropModal(false);
    setSelectedPropId(newId);
  }

  function handleCreateOrUpdateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    if (!roomNumber || !roomFloor || !roomRent) return toast.error(tCommon('please_fill'));

    const isDuplicate = rooms.some(
      (r) =>
        r.propertyId === selectedPropId &&
        r.roomNumber.toLowerCase() === roomNumber.toLowerCase() &&
        r.id !== editingRoomId
    );
    if (isDuplicate) {
      return toast.error(t('duplicate_room_number'));
    }

    if (editingRoomId) {
      onUpdateRoom({
        id: editingRoomId,
        propertyId: selectedPropId,
        roomNumber,
        floor: Number(roomFloor),
        rentAmount: Number(roomRent),
        status: roomStatus,
      });
      logAction(
        'Updated Room Details',
        'បានកែប្រែព័ត៌មានបន្ទប់',
        `Updated room ${roomNumber} in ${activeProperty?.name}`,
        `បានកែប្រែព័ត៌មានបន្ទប់ ${roomNumber} ក្នុងទីតាំង ${activeProperty?.nameKh}`
      );
    } else {
      onAddRoom({
        id: 'room-' + Date.now(),
        propertyId: selectedPropId,
        roomNumber,
        floor: Number(roomFloor),
        rentAmount: Number(roomRent),
        status: roomStatus,
      });
      logAction(
        'Created Room',
        'បានបង្កើតបន្ទប់ថ្មី',
        `Created room ${roomNumber} with base rent $${roomRent} in ${activeProperty?.name}`,
        `បានបង្កើតបន្ទប់លេខ ${roomNumber} តម្លៃមូលដ្ឋាន $${roomRent} ក្នុងទីតាំង ${activeProperty?.nameKh}`
      );
    }

    setRoomNumber('');
    setRoomFloor(1);
    setRoomRent(200);
    setRoomStatus('vacant');
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
        `Removed room ${rNumber} from property ${activeProperty?.name}`,
        `បានលុបបន្ទប់ជួលលេខ ${rNumber} ចេញពីទីតាំង ${activeProperty?.nameKh}`
      );
    }
  }

  async function handleDeletePropClick(pId: string, pName: string, pNameKh: string) {
    if (!canModify) return toast.error(tCommon('insufficient_permissions'));
    const count = rooms.filter((r) => r.propertyId === pId).length;
    if (count > 0) {
      return toast.error(t('cannot_delete_property_with_rooms', { count }));
    }
    const ok = await confirm({
      title: tCommon('confirm_delete'),
      confirmLabel: tCommon('delete'),
      variant: 'destructive',
    });
    if (ok) {
      onDeleteProperty(pId);
      logAction(
        'Deleted Property Location',
        'បានលុបទីតាំងផ្ទះជួល',
        `Deleted property location "${pName}"`,
        `បានលុបចោលទាំងស្រុងនូវទីតាំងផ្ទះជួលឈ្មោះ "${pNameKh}"`
      );
      const remaining = properties.filter((p) => p.id !== pId);
      setSelectedPropId(remaining.length > 0 ? remaining[0].id : '');
    }
  }

  return {
    selectedPropId,
    setSelectedPropId,
    activeProperty,
    activeRooms,
    // property modal
    showPropModal,
    openPropModal,
    closePropModal,
    propName,
    setPropName,
    propNameKh,
    setPropNameKh,
    propType,
    setPropType,
    propAddress,
    setPropAddress,
    propAddressKh,
    setPropAddressKh,
    handleCreateProp,
    // room modal
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
    handleDeletePropClick,
  };
}
