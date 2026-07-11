import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { requirePermission } from '@/lib/api/guard';
import { sendTelegramMessage } from '@/lib/api/telegram';

// POST /api/telegram/send — dispatch a message to a tenant's connected
// Telegram chat. Takes `tenantId`, not a raw chat ID: the chat ID and bot
// token are both resolved server-side so the client never holds either.
export async function POST(req: NextRequest) {
  const gate = await requirePermission('invoices.generate');
  if (gate instanceof NextResponse) return gate;
  try {
    const { tenantId, text } = await req.json();

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'tenantId is required.' }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ success: false, error: 'Message body is empty.' }, { status: 400 });
    }

    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found.' }, { status: 404 });
    }
    if (!tenant.telegramChatId) {
      return NextResponse.json(
        { success: false, error: "This tenant hasn't connected their Telegram account yet." },
        { status: 400 }
      );
    }

    const result = await sendTelegramMessage(tenant.telegramChatId, text);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice successfully dispatched via Telegram Bot!',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Internal Server Error in Telegram Send:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
