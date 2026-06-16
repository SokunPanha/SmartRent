'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { propertiesApi, roomsApi } from './properties.api';

export const propertyKeys = { all: ['properties'] as const };
export const roomKeys = { all: ['rooms'] as const };

export function useProperties() {
  return useQuery({ queryKey: propertyKeys.all, queryFn: propertiesApi.list });
}

export function useRooms() {
  return useQuery({ queryKey: roomKeys.all, queryFn: roomsApi.list });
}

/** Mutations for properties; invalidates both properties and rooms (delete cascades rooms). */
export function usePropertyMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: propertyKeys.all });
    qc.invalidateQueries({ queryKey: roomKeys.all });
  };

  const create = useMutation({
    mutationFn: propertiesApi.create,
    onSuccess: () => {
      invalidate();
      toast('Added property location!');
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: propertiesApi.remove,
    onSuccess: () => {
      invalidate();
      toast('Property location removed');
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, remove };
}

/** Mutations for rooms; keeps the parent property's totalRooms fresh by invalidating both. */
export function useRoomMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: roomKeys.all });
    qc.invalidateQueries({ queryKey: propertyKeys.all });
  };

  const create = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: (room) => {
      invalidate();
      toast(`Created room ${room.roomNumber}!`);
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: roomsApi.update,
    onSuccess: (room) => {
      invalidate();
      toast(`Saved room ${room.roomNumber}!`);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: roomsApi.remove,
    onSuccess: () => {
      invalidate();
      toast('Room successfully deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, update, remove };
}
