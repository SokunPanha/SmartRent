import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { ok, notFound, badRequest, serverError, readJson } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

type Params = { params: Promise<{ id: string }> };

// GET /api/invoices/:id
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!row) return notFound('Invoice not found');
    return ok(row);
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/invoices/:id — partial update (status, notes, telegram fields, ...)
export async function PATCH(req: Request, { params }: Params) {
  const gate = await requirePermission('invoices.generate');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const allowed = [
      'issueDate', 'dueDate', 'status', 'amountPaidUSD', 'paidDate', 'paymentMethod', 'notes',
      'telegramScheduledDate', 'telegramSentDate', 'telegramStatus', 'telegramError',
    ] as const;
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (Object.keys(patch).length === 0) return badRequest('No updatable fields provided');

    const [updated] = await db.update(invoices).set(patch).where(eq(invoices.id, id)).returning();
    if (!updated) return notFound('Invoice not found');
    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/invoices/:id
export async function DELETE(_req: Request, { params }: Params) {
  const gate = await requirePermission('invoices.generate');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const [existing] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!existing) return notFound('Invoice not found');
    await db.delete(invoices).where(eq(invoices.id, id));
    return ok({ id, deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
