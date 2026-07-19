import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userProperties, rooms, contracts } from '@/lib/db/schema';
import type { SessionUser } from './guard';

/**
 * Building (property) IDs a user is allowed to see and act on.
 *
 * Returns `null` to mean UNRESTRICTED — super admins, plus any user with zero
 * building assignments (which preserves the pre-scoping behavior so existing
 * accounts keep full visibility). A non-null array restricts the user to
 * exactly those buildings. Assign a user to buildings to switch them from
 * "sees everything" to "sees only these".
 */
export async function scopedPropertyIds(user: SessionUser): Promise<string[] | null> {
  if (user.isSuperAdmin) return null;
  const rows = await db
    .select({ propertyId: userProperties.propertyId })
    .from(userProperties)
    .where(eq(userProperties.userId, user.id));
  if (rows.length === 0) return null;
  return rows.map((r) => r.propertyId);
}

/** Subquery of room ids that belong to the given buildings. */
export function roomIdsInProperties(propertyIds: string[]) {
  return db.select({ id: rooms.id }).from(rooms).where(inArray(rooms.propertyId, propertyIds));
}

/** Subquery of tenant ids that hold a contract in the given buildings. */
export function tenantIdsInProperties(propertyIds: string[]) {
  return db
    .select({ id: contracts.tenantId })
    .from(contracts)
    .innerJoin(rooms, eq(contracts.roomId, rooms.id))
    .where(inArray(rooms.propertyId, propertyIds));
}

/** True when a building is within the user's scope (always true if unrestricted). */
export async function isPropertyInScope(user: SessionUser, propertyId: string): Promise<boolean> {
  const ids = await scopedPropertyIds(user);
  return ids === null || ids.includes(propertyId);
}

/** True when a room's building is within the user's scope. Unknown room = false. */
export async function isRoomInScope(user: SessionUser, roomId: string): Promise<boolean> {
  const ids = await scopedPropertyIds(user);
  if (ids === null) return true;
  const [room] = await db
    .select({ propertyId: rooms.propertyId })
    .from(rooms)
    .where(eq(rooms.id, roomId));
  return !!room && ids.includes(room.propertyId);
}

/** True when a tenant holds a lease in one of the user's scoped buildings. */
export async function isTenantInScope(user: SessionUser, tenantId: string): Promise<boolean> {
  const ids = await scopedPropertyIds(user);
  if (ids === null) return true;
  const [row] = await db
    .select({ id: contracts.id })
    .from(contracts)
    .innerJoin(rooms, eq(contracts.roomId, rooms.id))
    .where(and(eq(contracts.tenantId, tenantId), inArray(rooms.propertyId, ids)))
    .limit(1);
  return !!row;
}
