import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenantConnectCodes, tenants } from '@/lib/db/schema';
import { isValidWebhookSecret, sendTelegramMessage } from '@/lib/api/telegram';

const START_PATTERN = /^\/start(?:@\w+)?\s+(\S+)/;

/**
 * POST /api/telegram/webhook — Telegram calls this directly (no session
 * cookie; see PUBLIC_PREFIXES in auth.config.ts). Authenticity is verified
 * via the shared secret Telegram echoes back on every request, set during
 * `setWebhook`.
 *
 * Handles the tenant "connect" deep link: `t.me/<bot>?start=<code>` arrives
 * here as a `/start <code>` message. Always replies 200 so Telegram doesn't
 * retry-storm a message it already delivered.
 */
export async function POST(req: NextRequest) {
  if (!isValidWebhookSecret(req.headers.get('x-telegram-bot-api-secret-token'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const update = await req.json();
    const message = update?.message;
    const chatId: number | undefined = message?.chat?.id;
    const text: string | undefined = message?.text;

    if (!chatId || !text) return NextResponse.json({ ok: true });

    const match = text.match(START_PATTERN);
    if (!match) {
      await sendTelegramMessage(
        String(chatId),
        "Hi! To connect your account, use the link your property manager gave you."
      );
      return NextResponse.json({ ok: true });
    }

    const code = match[1];
    const now = new Date().toISOString();
    const [pending] = await db
      .select()
      .from(tenantConnectCodes)
      .where(
        and(
          eq(tenantConnectCodes.code, code),
          isNull(tenantConnectCodes.usedAt),
          gt(tenantConnectCodes.expiresAt, now)
        )
      );

    if (!pending) {
      await sendTelegramMessage(
        String(chatId),
        "That connect code is invalid or has expired. Please ask your property manager for a new one."
      );
      return NextResponse.json({ ok: true });
    }

    await db
      .update(tenants)
      .set({ telegramChatId: String(chatId) })
      .where(eq(tenants.id, pending.tenantId));
    await db
      .update(tenantConnectCodes)
      .set({ usedAt: now })
      .where(eq(tenantConnectCodes.id, pending.id));

    await sendTelegramMessage(
      String(chatId),
      "✅ You're connected! You'll receive your invoices here from now on."
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[telegram webhook] error:', err);
    return NextResponse.json({ ok: true });
  }
}
