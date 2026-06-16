import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rooms, properties } from '@/lib/db/schema';
import { ok, created, badRequest, serverError, readJson, missingField, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

// GET /api/rooms?propertyId=... — list rooms, optionally scoped to a property
export async function GET(req: Request) {
  try {
    const propertyId = new URL(req.url).searchParams.get('propertyId');
    const rows = propertyId
      ? await db.select().from(rooms).where(eq(rooms.propertyId, propertyId))
      : await db.select().from(rooms);
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
