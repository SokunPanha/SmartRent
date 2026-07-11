import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { meterReadings } from '@/lib/db/schema';
import { ok, notFound, serverError } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

type Params = { params: Promise<{ id: string }> };

// GET /api/readings/:id
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(meterReadings).where(eq(meterReadings.id, id));
    if (!row) return notFound('Reading not found');
    return ok(row);
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/readings/:id
export async function DELETE(_req: Request, { params }: Params) {
  const gate = await requirePermission('readings.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const [existing] = await db.select().from(meterReadings).where(eq(meterReadings.id, id));
    if (!existing) return notFound('Reading not found');
    await db.delete(meterReadings).where(eq(meterReadings.id, id));
    return ok({ id, deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
