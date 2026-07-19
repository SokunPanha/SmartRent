import { NextResponse } from 'next/server';
import { and, eq, inArray, sql, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rooms, properties } from '@/lib/db/schema';
import { ok, created, badRequest, forbidden, serverError, readJson, missingField, genId } from '@/lib/api/http';
import { requirePermission, requireUser } from '@/lib/api/guard';
import { scopedPropertyIds, isPropertyInScope } from '@/lib/api/scope';

// GET /api/rooms?propertyId=... — list rooms in the user's scoped buildings,
// optionally narrowed to a single property.
export async function GET(req: Request) {
  const gate = await requireUser();
  if (gate instanceof NextResponse) return gate;
  try {
    const propertyId = new URL(req.url).searchParams.get('propertyId');
    const ids = await scopedPropertyIds(gate);
    const filters: SQL[] = [];
    if (propertyId) filters.push(eq(rooms.propertyId, propertyId));
    if (ids) filters.push(inArray(rooms.propertyId, ids));
    const rows = await db
      .select()
      .from(rooms)
      .where(filters.length ? and(...filters) : undefined);
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/rooms — create a room and bump the parent property's totalRooms
export async function POST(req: Request) {
  const gate = await requirePermission('properties.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const missing = missingField(body, ['propertyId', 'roomNumber', 'floor', 'rentAmount']);
    if (missing) return badRequest(`Missing required field: ${missing}`);

    if (!(await isPropertyInScope(gate, body.propertyId as string))) {
      return forbidden('Outside your assigned buildings.');
    }

    const row = {
      id: (body.id as string) || genId('room'),
      propertyId: body.propertyId as string,
      roomNumber: body.roomNumber as string,
      floor: body.floor as number,
      rentAmount: body.rentAmount as number,
      status: (body.status as string) || 'vacant',
    };

    const [inserted] = await db.insert(rooms).values(row).returning();
    await db
      .update(properties)
      .set({ totalRooms: sql`${properties.totalRooms} + 1` })
      .where(eq(properties.id, row.propertyId));

    return created(inserted);
  } catch (err) {
    return serverError(err);
  }
}
