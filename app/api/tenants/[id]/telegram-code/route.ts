import { NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenantConnectCodes, tenants } from '@/lib/db/schema';
import { ok, notFound, serverError, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

type Params = { params: Promise<{ id: string }> };

const CODE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /api/tenants/:id/telegram-code — (re)generate a one-time Telegram
// connect code for this tenant. Invalidates any still-unused prior code so
// only one is ever valid at a time.
export async function POST(_req: Request, { params }: Params) {
  const gate = await requirePermission('tenants.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    if (!tenant) return notFound('Tenant not found');

    await db
      .update(tenantConnectCodes)
      .set({ usedAt: new Date().toISOString() })
      .where(and(eq(tenantConnectCodes.tenantId, id), isNull(tenantConnectCodes.usedAt)));

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();
    const [inserted] = await db
      .insert(tenantConnectCodes)
      .values({ id: genId('code'), tenantId: id, code, expiresAt })
      .returning();

    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    const deepLink = botUsername ? `https://t.me/${botUsername}?start=${code}` : null;

    return ok({ code: inserted.code, expiresAt: inserted.expiresAt, deepLink });
  } catch (err) {
    return serverError(err);
  }
}
