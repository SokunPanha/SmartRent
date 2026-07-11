import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenantMessages } from '@/lib/db/schema';
import { ok, created, badRequest, serverError, readJson, genId } from '@/lib/api/http';
import { requireLinkedTenant } from '@/lib/api/telegram-auth';

// GET /api/telegram-app/messages — the connected tenant's full message thread.
export async function GET(req: NextRequest) {
  try {
    const tenant = await requireLinkedTenant(req.headers.get('x-telegram-init-data'));
    if (tenant instanceof NextResponse) return tenant;

    const rows = await db
      .select()
      .from(tenantMessages)
      .where(eq(tenantMessages.tenantId, tenant.id))
      .orderBy(asc(tenantMessages.createdAt));
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/telegram-app/messages — the tenant sends a message to staff.
export async function POST(req: NextRequest) {
  try {
    const tenant = await requireLinkedTenant(req.headers.get('x-telegram-init-data'));
    if (tenant instanceof NextResponse) return tenant;

    const body = await readJson<{ body?: string }>(req);
    if (!body?.body || body.body.trim() === '') return badRequest('Message body is empty.');

    const [inserted] = await db
      .insert(tenantMessages)
      .values({
        id: genId('msg'),
        tenantId: tenant.id,
        senderType: 'tenant',
        body: body.body.trim(),
      })
      .returning();
    return created(inserted);
  } catch (err) {
    return serverError(err);
  }
}
