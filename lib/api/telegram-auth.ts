import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';

/**
 * Auth for the tenant-facing Telegram Mini App. This is a separate identity
 * system from lib/api/guard.ts's session-cookie based
 * requireUser/requirePermission — tenants have no TenantTrack login. Every
 * request instead carries Telegram's signed `initData` payload, verified
 * per-request against the bot token.
 */

type TenantRow = typeof tenants.$inferSelect;

// Telegram recommends treating stale initData as invalid; the Mini App SDK
// re-issues it on every app open, so a generous window still catches replay
// of a captured payload without breaking a tenant's normal session length.
const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set. See .env.example.');
  return token;
}

/**
 * Verify Telegram Mini App `initData` per
 * https://docs.telegram-mini-apps.com/platform/init-data — HMAC-SHA256 of the
 * sorted `key=value` pairs, keyed with HMAC-SHA256("WebAppData", bot_token).
 * Returns the verified Telegram user id, or null if invalid/stale/malformed.
 */
export function verifyInitData(initData: string): { telegramUserId: string } | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');

    const authDate = Number(params.get('auth_date'));
    if (!authDate || Date.now() / 1000 - authDate > MAX_INIT_DATA_AGE_SECONDS) return null;

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(getBotToken()).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const a = Buffer.from(computedHash);
    const b = Buffer.from(hash);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const userJson = params.get('user');
    if (!userJson) return null;
    const user = JSON.parse(userJson);
    if (!user?.id) return null;

    return { telegramUserId: String(user.id) };
  } catch {
    return null;
  }
}

/** Resolve the tenant linked to this `initData`'s Telegram user, or a ready-to-send error response. */
export async function requireLinkedTenant(initData: string | null): Promise<TenantRow | NextResponse> {
  if (!initData) {
    return NextResponse.json({ error: 'Missing Telegram init data' }, { status: 401 });
  }

  const verified = verifyInitData(initData);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid Telegram init data' }, { status: 401 });
  }

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.telegramChatId, verified.telegramUserId));

  if (!tenant) {
    return NextResponse.json(
      { error: 'not_connected', message: 'Ask your property manager to connect your Telegram first.' },
      { status: 404 }
    );
  }

  return tenant;
}
