import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { fees } from '@/lib/db/schema';
import { ok, created, badRequest, serverError, readJson, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

const CURRENCIES = ['USD', 'KHR'];

// GET /api/settings/fees — the flat-fee catalog (admin).
export async function GET() {
  const gate = await requirePermission('admin.settings');
  if (gate instanceof NextResponse) return gate;
  try {
    const rows = await db.select().from(fees).orderBy(asc(fees.sortOrder), asc(fees.name));
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/settings/fees — add a flat-fee type to the catalog.
export async function POST(req: Request) {
  const gate = await requirePermission('admin.settings');
  if (gate instanceof NextResponse) return gate;
  try {
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');
    const name = String(body.name ?? '').trim();
    const nameKh = String(body.nameKh ?? '').trim();
    if (!name || !nameKh) return badRequest('Name (English and Khmer) is required');
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 0) return badRequest('Amount must be a non-negative number');
    const currency = CURRENCIES.includes(body.currency as string) ? (body.currency as string) : 'USD';

    const [row] = await db
      .insert(fees)
      .values({
        id: genId('fee'),
        name,
        nameKh,
        amount,
        currency,
        active: body.active === undefined ? true : Boolean(body.active),
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      })
      .returning();
    return created(row);
  } catch (err) {
    return serverError(err);
  }
}
