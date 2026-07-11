import { NextRequest, NextResponse } from 'next/server';
import { ok, serverError } from '@/lib/api/http';
import { requireLinkedTenant } from '@/lib/api/telegram-auth';

// GET /api/telegram-app/me — resolve the tenant linked to the caller's
// Telegram account (via the `X-Telegram-Init-Data` header), or a
// `not_connected` 404 the Mini App uses to show its "connect first" screen.
export async function GET(req: NextRequest) {
  try {
    const tenant = await requireLinkedTenant(req.headers.get('x-telegram-init-data'));
    if (tenant instanceof NextResponse) return tenant;
    return ok(tenant);
  } catch (err) {
    return serverError(err);
  }
}
