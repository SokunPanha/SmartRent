import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { Property, Room } from '@/lib/types';

/** HTTP calls for the properties + rooms endpoints. */
export const propertiesApi = {
  list: () => apiGet<Property[]>('/api/properties'),
  create: (data: Omit<Property, 'totalRooms'>) => apiPost<Property>('/api/properties', data),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/properties/${id}`),
};

export const roomsApi = {
  list: () => apiGet<Room[]>('/api/rooms'),
  create: (data: Room) => apiPost<Room>('/api/rooms', data),
  update: (data: Room) => apiPatch<Room>(`/api/rooms/${data.id}`, data),
  remove: (id: string) => apiDelete<{ id: string }>(`/api/rooms/${id}`),
};
