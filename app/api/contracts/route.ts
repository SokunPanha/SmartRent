import { NextResponse } from 'next/server';
import { and, eq, inArray, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contracts, rooms } from '@/lib/db/schema';
import { ok, created, badRequest, forbidden, serverError, readJson, missingField, genId } from '@/lib/api/http';
import { requirePermission, requireUser } from '@/lib/api/guard';
import { scopedPropertyIds, roomIdsInProperties, isRoomInScope } from '@/lib/api/scope';

// GET /api/contracts?status=active — list contracts in the user's scoped
// buildings, with an optional status filter.
export async function GET(req: Request) {
  const gate = await requireUser();
  if (gate instanceof NextResponse) return gate;
  try {
    const status = new URL(req.url).searchParams.get('status');
    const ids = await scopedPropertyIds(gate);
    const filters: SQL[] = [];
    if (status) filters.push(eq(contracts.status, status));
    if (ids) filters.push(inArray(contracts.roomId, roomIdsInProperties(ids)));
    const rows = await db
      .select()
      .from(contracts)
      .where(filters.length ? and(...filters) : undefined);
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/contracts — create a lease and mark its room occupied
export async function POST(req: Request) {
  const gate = await requirePermission('tenants.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const missing = missingField(body, [
      'roomId', 'tenantId', 'startDate', 'endDate',
      'rentAmount', 'depositAmount', 'electricityRate', 'waterRate',
    ]);
    if (missing) return badRequest(`Missing required field: ${missing}`);

    if (!(await isRoomInScope(gate, body.roomId as string))) {
      return forbidden('Outside your assigned buildings.');
    }

    const row = {
      id: (body.id as string) || genId('contract'),
      roomId: body.roomId as string,
      tenantId: body.tenantId as string,
      startDate: body.startDate as string,
      endDate: body.endDate as string,
      rentAmount: body.rentAmount as number,
      depositAmount: body.depositAmount as number,
      electricityRate: body.electricityRate as number,
      waterRate: body.waterRate as number,
      status: (body.status as string) || 'active',
    };

    const [inserted] = await db.insert(contracts).values(row).returning();

    // Reactive link: an active lease occupies its room.
    if (row.status === 'active') {
      await db.update(rooms).set({ status: 'occupied' }).where(eq(rooms.id, row.roomId));
    }

    return created(inserted);
  } catch (err) {
    return serverError(err);
  }
}
