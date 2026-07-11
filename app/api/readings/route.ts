import { NextResponse } from 'next/server';
import { and, eq, desc, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { meterReadings } from '@/lib/db/schema';
import { ok, created, badRequest, serverError, readJson, missingField, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

// GET /api/readings?roomId=&year=&month= — list meter readings, newest first
export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const filters: SQL[] = [];
    const roomId = sp.get('roomId');
    const year = sp.get('year');
    const month = sp.get('month');
    if (roomId) filters.push(eq(meterReadings.roomId, roomId));
    if (year) filters.push(eq(meterReadings.year, Number(year)));
    if (month) filters.push(eq(meterReadings.month, Number(month)));

    const rows = await db
      .select()
      .from(meterReadings)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(meterReadings.readingDate));
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/readings — log a meter reading
export async function POST(req: Request) {
  const gate = await requirePermission('readings.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const missing = missingField(body, [
      'roomId', 'readingDate', 'year', 'month',
      'prevElectricityValue', 'currElectricityValue', 'prevWaterValue', 'currWaterValue', 'recordedBy',
    ]);
    if (missing) return badRequest(`Missing required field: ${missing}`);

    const prevElec = Number(body.prevElectricityValue);
    const currElec = Number(body.currElectricityValue);
    const prevWater = Number(body.prevWaterValue);
    const currWater = Number(body.currWaterValue);
    if ([prevElec, currElec, prevWater, currWater].some((n) => Number.isNaN(n) || n < 0)) {
      return badRequest('Meter values must be non-negative numbers');
    }
    if (currElec < prevElec) {
      return badRequest('Current electricity reading cannot be less than the previous reading');
    }
    if (currWater < prevWater) {
      return badRequest('Current water reading cannot be less than the previous reading');
    }

    const row = {
      id: (body.id as string) || genId('mr'),
      roomId: body.roomId as string,
      readingDate: body.readingDate as string,
      year: body.year as number,
      month: body.month as number,
      prevElectricityValue: body.prevElectricityValue as number,
      currElectricityValue: body.currElectricityValue as number,
      prevWaterValue: body.prevWaterValue as number,
      currWaterValue: body.currWaterValue as number,
      recordedBy: body.recordedBy as string,
    };

    const [inserted] = await db.insert(meterReadings).values(row).returning();
    return created(inserted);
  } catch (err) {
    return serverError(err);
  }
}
