import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { fees, propertyFees } from '@/lib/db/schema';
import { ok, notFound, badRequest, serverError, readJson } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

type Params = { params: Promise<{ id: string }> };
const CURRENCIES = ['USD', 'KHR'];

// PATCH /api/settings/fees/:id — edit a catalog fee.
export async function PATCH(req: Request, { params }: Params) {
  const gate = await requirePermission('admin.settings');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return badRequest('Name cannot be empty');
      patch.name = name;
    }
    if (body.nameKh !== undefined) {
      const nameKh = String(body.nameKh).trim();
      if (!nameKh) return badRequest('Khmer name cannot be empty');
      patch.nameKh = nameKh;
    }
    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount < 0) return badRequest('Amount must be a non-negative number');
      patch.amount = amount;
    }
    if (body.currency !== undefined) {
      if (!CURRENCIES.includes(body.currency as string)) return badRequest('Invalid currency');
      patch.currency = body.currency;
    }
    if (body.active !== undefined) patch.active = Boolean(body.active);
    if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
      patch.sortOrder = Number(body.sortOrder);
    }
    if (Object.keys(patch).length === 0) return badRequest('No updatable fields provided');

    const [updated] = await db.update(fees).set(patch).where(eq(fees.id, id)).returning();
    if (!updated) return notFound('Fee not found');
    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/settings/fees/:id — remove a catalog fee and every building's
// opt-in for it. Past invoices keep their snapshot in `invoice_fees`.
export async function DELETE(_req: Request, { params }: Params) {
  const gate = await requirePermission('admin.settings');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const [existing] = await db.select().from(fees).where(eq(fees.id, id));
    if (!existing) return notFound('Fee not found');
    await db.delete(propertyFees).where(eq(propertyFees.feeId, id));
    await db.delete(fees).where(eq(fees.id, id));
    return ok({ id, deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
