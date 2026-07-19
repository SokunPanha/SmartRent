import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contracts, rooms } from '@/lib/db/schema';
import { ok, notFound, badRequest, forbidden, serverError, readJson } from '@/lib/api/http';
import { requirePermission, requireUser } from '@/lib/api/guard';
import { isRoomInScope } from '@/lib/api/scope';

type Params = { params: Promise<{ id: string }> };

// GET /api/contracts/:id
export async function GET(_req: Request, { params }: Params) {
  const gate = await requireUser();
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const [row] = await db.select().from(contracts).where(eq(contracts.id, id));
    if (!row) return notFound('Contract not found');
    if (!(await isRoomInScope(gate, row.roomId))) return notFound('Contract not found');
    return ok(row);
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/contracts/:id — update lease (commonly status). Suspending/expiring
// a lease frees its room; reactivating it re-occupies the room.
export async function PATCH(req: Request, { params }: Params) {
  const gate = await requirePermission('tenants.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const [current] = await db.select().from(contracts).where(eq(contracts.id, id));
    if (!current) return notFound('Contract not found');
    if (!(await isRoomInScope(gate, current.roomId))) return forbidden('Outside your assigned buildings.');
    if (body.roomId !== undefined && !(await isRoomInScope(gate, body.roomId as string))) {
      return forbidden('Outside your assigned buildings.');
    }

    const allowed = [
      'roomId', 'tenantId', 'startDate', 'endDate',
      'rentAmount', 'depositAmount', 'electricityRate', 'waterRate', 'status',
    ] as const;
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (Object.keys(patch).length === 0) return badRequest('No updatable fields provided');

    const [updated] = await db.update(contracts).set(patch).where(eq(contracts.id, id)).returning();
    if (!updated) return notFound('Contract not found');

    if (patch.status === 'expired' || patch.status === 'suspended') {
      await db.update(rooms).set({ status: 'vacant' }).where(eq(rooms.id, updated.roomId));
    } else if (patch.status === 'active') {
      await db.update(rooms).set({ status: 'occupied' }).where(eq(rooms.id, updated.roomId));
    }

    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/contracts/:id — frees the linked room
export async function DELETE(_req: Request, { params }: Params) {
  const gate = await requirePermission('tenants.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const [existing] = await db.select().from(contracts).where(eq(contracts.id, id));
    if (!existing) return notFound('Contract not found');
    if (!(await isRoomInScope(gate, existing.roomId))) return forbidden('Outside your assigned buildings.');

    await db.delete(contracts).where(eq(contracts.id, id));
    await db.update(rooms).set({ status: 'vacant' }).where(eq(rooms.id, existing.roomId));

    return ok({ id, deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
