import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { ok, notFound, badRequest, forbidden, serverError, readJson } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';
import { isRoomInScope } from '@/lib/api/scope';

type Params = { params: Promise<{ id: string }> };

const METHODS = ['cash', 'aba', 'wing', 'other'];

// POST /api/invoices/:id/payment — record a (partial) payment against an invoice.
// Body: { amount: number, method: 'cash'|'aba'|'wing'|'other', notes?: string }
export async function POST(req: Request, { params }: Params) {
  const gate = await requirePermission('invoices.pay');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const body = await readJson<{ amount?: number; method?: string; notes?: string }>(req);
    if (!body) return badRequest('Invalid JSON body');

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return badRequest('`amount` must be a positive number');
    }
    if (!body.method || !METHODS.includes(body.method)) {
      return badRequest(`\`method\` must be one of: ${METHODS.join(', ')}`);
    }

    const [inv] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!inv) return notFound('Invoice not found');
    if (!(await isRoomInScope(gate, inv.roomId))) return forbidden('Outside your assigned buildings.');

    const nextPaid = Number((inv.amountPaidUSD + amount).toFixed(2));
    const fullyPaid = nextPaid >= Number((inv.totalAmountUSD - 0.01).toFixed(2));

    const [updated] = await db
      .update(invoices)
      .set({
        amountPaidUSD: nextPaid,
        status: fullyPaid ? 'paid' : 'partial',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: body.method,
        notes: body.notes ?? inv.notes,
      })
      .where(eq(invoices.id, id))
      .returning();

    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}
