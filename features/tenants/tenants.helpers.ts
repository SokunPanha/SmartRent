import { Tenant, Room, Property, AppLanguage } from '@/lib/types';

export function getRoomName(
  rooms: Room[],
  properties: Property[],
  roomId: string,
  lang: AppLanguage
): string {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return 'Unknown';
  const prop = properties.find((p) => p.id === room.propertyId);
  return `${room.roomNumber} - ${lang === 'en' ? prop?.name : prop?.nameKh}`;
}

export function getTenantName(tenants: Tenant[], tenantId: string, lang: AppLanguage): string {
  const tenant = tenants.find((tn) => tn.id === tenantId);
  return tenant ? (lang === 'en' ? tenant.name : tenant.nameKh) : 'Unknown';
}

