import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { properties, rooms } from '@/lib/db/schema';
import { ok, notFound, badRequest, forbidden, serverError, readJson } from '@/lib/api/http';
import { requirePermission, requireUser } from '@/lib/api/guard';
import { isPropertyInScope } from '@/lib/api/scope';

type Params = { params: Promise<{ id: string }> };

// GET /api/properties/:id
export async function GET(_req: Request, { params }: Params) {
  const gate = await requireUser();
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    if (!(await isPropertyInScope(gate, id))) return notFound('Property not found');
    const [row] = await db.select().from(properties).where(eq(properties.id, id));
    if (!row) return notFound('Property not found');
    return ok(row);
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/properties/:id — partial update
export async function PATCH(req: Request, { params }: Params) {
  const gate = await requirePermission('properties.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    if (!(await isPropertyInScope(gate, id))) return forbidden('Outside your assigned buildings.');
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const allowed = ['name', 'nameKh', 'type', 'address', 'addressKh', 'totalRooms'] as const;
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    // Nullable zone rate overrides: explicit `null` clears the override (falls
    // back to the system default), a number sets it. `undefined` = untouched.
    for (const key of ['electricityRate', 'waterRate'] as const) {
      if (body[key] !== undefined) {
        patch[key] = body[key] === null ? null : Number(body[key]);
      }
    }
    if (Object.keys(patch).length === 0) return badRequest('No updatable fields provided');

    const [updated] = await db
      .update(properties)
      .set(patch)
      .where(eq(properties.id, id))
      .returning();
    if (!updated) return notFound('Property not found');
    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/properties/:id — also removes the property's rooms
export async function DELETE(_req: Request, { params }: Params) {
  const gate = await requirePermission('properties.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    if (!(await isPropertyInScope(gate, id))) return forbidden('Outside your assigned buildings.');
    const [existing] = await db.select().from(properties).where(eq(properties.id, id));
    if (!existing) return notFound('Property not found');

    await db.delete(rooms).where(eq(rooms.propertyId, id));
    await db.delete(properties).where(eq(properties.id, id));
    return ok({ id, deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
