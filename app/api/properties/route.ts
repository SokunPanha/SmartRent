import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { properties } from '@/lib/db/schema';
import { ok, created, badRequest, serverError, readJson, missingField, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

// GET /api/properties — list all properties
export async function GET() {
  try {
    const rows = await db.select().from(properties);
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/properties — create a property
export async function POST(req: Request) {
  const gate = await requirePermission('properties.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const missing = missingField(body, ['name', 'nameKh', 'type', 'address', 'addressKh']);
    if (missing) return badRequest(`Missing required field: ${missing}`);

    const row = {
      id: (body.id as string) || genId('prop'),
      name: body.name as string,
      nameKh: body.nameKh as string,
      type: body.type as string,
      address: body.address as string,
      addressKh: body.addressKh as string,
      totalRooms: typeof body.totalRooms === 'number' ? body.totalRooms : 0,
      electricityRate: typeof body.electricityRate === 'number' ? body.electricityRate : null,
      waterRate: typeof body.waterRate === 'number' ? body.waterRate : null,
    };

    const [inserted] = await db.insert(properties).values(row).returning();
    return created(inserted);
  } catch (err) {
    return serverError(err);
  }
}
