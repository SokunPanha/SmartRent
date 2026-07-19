import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { roles, rolePermissions } from '@/lib/db/schema';
import { ok, created, badRequest, serverError, readJson, genId } from '@/lib/api/http';
import { requireAdmin } from '@/lib/api/guard';
import { isPermissionKey } from '@/lib/permissions';

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

// GET /api/roles — admin only. All roles with their granted permissions.
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const [roleRows, permRows] = await Promise.all([
      db.select().from(roles),
      db.select().from(rolePermissions),
    ]);
    const byRole = new Map<string, string[]>();
    for (const p of permRows) {
      const list = byRole.get(p.roleId) ?? [];
      list.push(p.permission);
      byRole.set(p.roleId, list);
    }
    const result: RoleWithPermissions[] = roleRows
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        permissions: byRole.get(r.id) ?? [],
      }))
      // System roles first, then alphabetical.
      .sort((a, b) => Number(b.isSystem) - Number(a.isSystem) || a.name.localeCompare(b.name));
    return ok(result);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/roles — admin only. Create a role with optional initial permissions.
export async function POST(req: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const body = await readJson<{ name?: string; description?: string; permissions?: string[] }>(req);
    const name = body?.name?.trim();
    if (!name) return badRequest('Role name is required');
    const description = body?.description?.trim() || null;

    const existing = await db.select().from(roles);
    if (existing.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      return badRequest('A role with that name already exists');
    }

    const id = genId('role');
    await db.insert(roles).values({ id, name, description, isSystem: false });

    const perms = (body?.permissions ?? []).filter(isPermissionKey);
    if (perms.length) {
      await db.insert(rolePermissions).values(perms.map((permission) => ({ roleId: id, permission })));
    }

    return created({ id, name, description, isSystem: false, permissions: perms });
  } catch (err) {
    return serverError(err);
  }
}
