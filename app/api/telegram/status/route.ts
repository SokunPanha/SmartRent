import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/api/guard';
import { getBotIdentity } from '@/lib/api/telegram';

// GET /api/telegram/status — admin health check for the configured bot
// (replaces the old client-side "paste a token and test it" flow).
export async function GET() {
  const gate = await requirePermission('invoices.generate');
  if (gate instanceof NextResponse) return gate;

  const identity = await getBotIdentity();
  if (!identity.ok) {
    return NextResponse.json({ connected: false, error: identity.error }, { status: 502 });
  }
  return NextResponse.json({ connected: true, username: identity.username });
}
