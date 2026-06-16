import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contracts, rooms } from '@/lib/db/schema';
import { ok, created, badRequest, serverError, readJson, missingField, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

// GET /api/contracts?status=active — list contracts, optional status filter
export async function GET(req: Request) {
  try {
    const status = new URL(req.url).searchParams.get('status');
    const rows = status
      ? await db.select().from(contracts).where(eq(contracts.status, status))
      : await db.select().from(contracts);
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
