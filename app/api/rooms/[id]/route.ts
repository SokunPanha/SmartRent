import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rooms, properties } from '@/lib/db/schema';
import { ok, notFound, badRequest, serverError, readJson } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

type Params = { params: Promise<{ id: string }> };

// GET /api/rooms/:id
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(rooms).where(eq(rooms.id, id));
    if (!row) return notFound('Room not found');
    return ok(row);
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/rooms/:id
export async function PATCH(req: Request, { params }: Params) {
  const gate = await requirePermission('properties.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const allowed = ['roomNumber', 'floor', 'rentAmount', 'status', 'propertyId'] as const;
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (Object.keys(patch).length === 0) return badRequest('No updatable fields provided');

    const [updated] = await db.update(rooms).set(patch).where(eq(rooms.id, id)).returning();
    if (!updated) return notFound('Room not found');
    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/rooms/:id — decrement the parent property's totalRooms
export async function DELETE(_req: Request, { params }: Params) {
  const gate = await requirePermission('properties.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const [existing] = await db.select().from(rooms).where(eq(rooms.id, id));
    if (!existing) return notFound('Room not found');

    await db.delete(rooms).where(eq(rooms.id, id));
    await db
      .update(properties)
      .set({ totalRooms: sql`GREATEST(${properties.totalRooms} - 1, 0)` })
      .where(eq(properties.id, existing.propertyId));

    return ok({ id, deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
