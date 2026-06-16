import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { ok, notFound, badRequest, serverError, readJson } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

type Params = { params: Promise<{ id: string }> };

// GET /api/tenants/:id
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(tenants).where(eq(tenants.id, id));
    if (!row) return notFound('Tenant not found');
    return ok(row);
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/tenants/:id
export async function PATCH(req: Request, { params }: Params) {
  const gate = await requirePermission('tenants.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const allowed = [
      'name', 'nameKh', 'phone', 'nationalId', 'email',
      'checkInDate', 'emergencyContact', 'telegramChatId', 'telegramAutoSend',
    ] as const;
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (Object.keys(patch).length === 0) return badRequest('No updatable fields provided');

    const [updated] = await db.update(tenants).set(patch).where(eq(tenants.id, id)).returning();
    if (!updated) return notFound('Tenant not found');
    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/tenants/:id
export async function DELETE(_req: Request, { params }: Params) {
  const gate = await requirePermission('tenants.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const [existing] = await db.select().from(tenants).where(eq(tenants.id, id));
    if (!existing) return notFound('Tenant not found');
    await db.delete(tenants).where(eq(tenants.id, id));
    return ok({ id, deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
