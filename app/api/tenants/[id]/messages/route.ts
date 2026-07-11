import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenantMessages, tenants } from '@/lib/db/schema';
import { ok, created, badRequest, notFound, serverError, readJson, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';
import { sendTelegramMessage } from '@/lib/api/telegram';

type Params = { params: Promise<{ id: string }> };

// GET /api/tenants/:id/messages — staff reads a tenant's thread. Marks the
// thread as read (clears the unread badge in the admin Tenant list).
export async function GET(_req: Request, { params }: Params) {
  const gate = await requirePermission('tenants.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const rows = await db
      .select()
      .from(tenantMessages)
      .where(eq(tenantMessages.tenantId, id))
      .orderBy(asc(tenantMessages.createdAt));

    await db
      .update(tenants)
      .set({ telegramMessagesReadAt: new Date().toISOString() })
      .where(eq(tenants.id, id));

    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/tenants/:id/messages — staff replies. Also pings the tenant on
// Telegram (if connected) so they know to check the portal.
export async function POST(req: Request, { params }: Params) {
  const gate = await requirePermission('tenants.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const body = await readJson<{ body?: string }>(req);
    if (!body?.body || body.body.trim() === '') return badRequest('Message body is empty.');

    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    if (!tenant) return notFound('Tenant not found');

    const [inserted] = await db
      .insert(tenantMessages)
      .values({
        id: genId('msg'),
        tenantId: id,
        senderType: 'staff',
        senderUserId: gate.id,
        body: body.body.trim(),
      })
      .returning();

    await db
      .update(tenants)
      .set({ telegramMessagesReadAt: new Date().toISOString() })
      .where(eq(tenants.id, id));

    if (tenant.telegramChatId) {
      await sendTelegramMessage(
        tenant.telegramChatId,
        `💬 <b>New message from your property manager:</b>\n${body.body.trim()}`
      );
    }

    return created(inserted);
  } catch (err) {
    return serverError(err);
  }
}
