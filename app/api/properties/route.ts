import { NextResponse } from 'next/server';
import { inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { properties } from '@/lib/db/schema';
import { ok, created, badRequest, forbidden, serverError, readJson, missingField, genId } from '@/lib/api/http';
import { requirePermission, requireUser } from '@/lib/api/guard';
import { scopedPropertyIds } from '@/lib/api/scope';

// GET /api/properties — list buildings the signed-in user is scoped to
export async function GET() {
  const gate = await requireUser();
  if (gate instanceof NextResponse) return gate;
  try {
    const ids = await scopedPropertyIds(gate);
    const rows = ids
      ? await db.select().from(properties).where(inArray(properties.id, ids))
      : await db.select().from(properties);
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/properties — create a property (only unrestricted users; a
// building-scoped staff cannot create buildings outside their assignment).
export async function POST(req: Request) {
  const gate = await requirePermission('properties.manage');
  if (gate instanceof NextResponse) return gate;
  if ((await scopedPropertyIds(gate)) !== null) {
    return forbidden('You can only manage your assigned buildings.');
  }
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
