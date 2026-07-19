import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { properties } from '@/lib/db/schema';
import { ok, notFound, badRequest, forbidden, serverError, readJson } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';
import { verifyUserPassword } from '@/lib/api/verify-password';

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/settings/zone-rates/:id — update a building's per-zone rate
 * overrides (electricity / water). Password-gated like the other settings
 * changes. Deliberately separate from /api/properties/:id so the Properties
 * page keeps editing rooms/properties without a password prompt.
 *
 * A `null` value clears the override (falls back to the system default).
 */
export async function PATCH(req: Request, { params }: Params) {
  const gate = await requirePermission('admin.settings');
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    if (!(await verifyUserPassword(gate.id, body.password))) {
      return forbidden('Incorrect password.');
    }

    const patch: Record<string, unknown> = {};
    for (const key of ['electricityRate', 'waterRate'] as const) {
      if (body[key] !== undefined) {
        patch[key] = body[key] === null ? null : Number(body[key]);
      }
    }
    if (Object.keys(patch).length === 0) return badRequest('No updatable fields provided');

    const [updated] = await db
      .update(properties)
      .set(patch)
      .where(eq(properties.id, id))
      .returning();
    if (!updated) return notFound('Property not found');
    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}
