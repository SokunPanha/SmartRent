import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { propertyFees } from '@/lib/db/schema';
import { ok, badRequest, serverError, readJson } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

type Params = { params: Promise<{ propertyId: string }> };

// GET /api/settings/property-fees/:propertyId — the flat fees this building
// charges, as { feeId, amount } (amount = per-building override, or null to
// use the catalog default).
export async function GET(_req: Request, { params }: Params) {
  const gate = await requirePermission('admin.settings');
  if (gate instanceof NextResponse) return gate;
  try {
    const { propertyId } = await params;
    const rows = await db
      .select({ feeId: propertyFees.feeId, amount: propertyFees.amount })
      .from(propertyFees)
      .where(eq(propertyFees.propertyId, propertyId));
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// PUT /api/settings/property-fees/:propertyId — replace the building's opted-in
// fee set wholesale. Body: { fees: [{ feeId, amount?: number|null }] }.
export async function PUT(req: Request, { params }: Params) {
  const gate = await requirePermission('admin.settings');
  if (gate instanceof NextResponse) return gate;
  try {
    const { propertyId } = await params;
    const body = await readJson<{ fees?: { feeId: string; amount?: number | null }[] }>(req);
    if (!body || !Array.isArray(body.fees)) return badRequest('Expected { fees: [...] }');

    const rows = body.fees
      .filter((f) => f && typeof f.feeId === 'string')
      .map((f) => ({
        propertyId,
        feeId: f.feeId,
        amount:
          f.amount === null || f.amount === undefined || !Number.isFinite(Number(f.amount))
            ? null
            : Number(f.amount),
      }));

    await db.delete(propertyFees).where(eq(propertyFees.propertyId, propertyId));
    if (rows.length) await db.insert(propertyFees).values(rows);
    return ok(rows.map((r) => ({ feeId: r.feeId, amount: r.amount })));
  } catch (err) {
    return serverError(err);
  }
}
