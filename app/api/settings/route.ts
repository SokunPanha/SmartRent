import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { systemSettings } from '@/lib/db/schema';
import { ok, badRequest, forbidden, serverError, readJson } from '@/lib/api/http';
import { requireUser, requirePermission } from '@/lib/api/guard';
import { getOrCreateSettings } from '@/lib/api/settings';
import { verifyUserPassword } from '@/lib/api/verify-password';

// GET /api/settings — any signed-in user can read (exchange rate + default
// utility prices are shown/used throughout the app, not just by admins).
export async function GET() {
  const gate = await requireUser();
  if (gate instanceof NextResponse) return gate;
  try {
    const settings = await getOrCreateSettings();
    return ok(settings);
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/settings — update the exchange rate / default utility prices.
export async function PATCH(req: Request) {
  const gate = await requirePermission('admin.settings');
  if (gate instanceof NextResponse) return gate;
  try {
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    // Re-confirm the acting admin's identity before changing rates that affect
    // every invoice in the system.
    if (!(await verifyUserPassword(gate.id, body.password))) {
      return forbidden('Incorrect password.');
    }

    const allowed = ['exchangeRateKhr', 'defaultElectricityRate', 'defaultWaterRate'] as const;
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        const value = Number(body[key]);
        if (!Number.isFinite(value) || value <= 0) {
          return badRequest(`Invalid value for ${key}`);
        }
        patch[key] = value;
      }
    }
    if (Object.keys(patch).length === 0) return badRequest('No updatable fields provided');
    patch.updatedAt = new Date().toISOString();

    // Ensure the singleton row exists before patching it.
    await getOrCreateSettings();
    const [updated] = await db
      .update(systemSettings)
      .set(patch)
      .where(eq(systemSettings.id, 'global'))
      .returning();
    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}
