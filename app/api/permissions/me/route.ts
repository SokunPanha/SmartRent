import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rolePermissions } from '@/lib/db/schema';
import { ok, serverError } from '@/lib/api/http';
import { requireUser } from '@/lib/api/guard';
import { PERMISSION_KEYS } from '@/lib/permissions';

// GET /api/permissions/me — the signed-in user's effective permissions.
export async function GET() {
  const gate = await requireUser();
  if (gate instanceof NextResponse) return gate;
  try {
    if (gate.isSuperAdmin) {
      return ok({ isSuperAdmin: true, permissions: [...PERMISSION_KEYS] });
    }
    if (!gate.roleId) {
      return ok({ isSuperAdmin: false, permissions: [] });
    }
    const rows = await db
      .select({ permission: rolePermissions.permission })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, gate.roleId));
    return ok({ isSuperAdmin: false, permissions: rows.map((r) => r.permission) });
  } catch (err) {
    return serverError(err);
  }
}
