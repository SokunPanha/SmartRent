import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { roles, rolePermissions, users } from '@/lib/db/schema';
import { ok, notFound, badRequest, serverError, readJson } from '@/lib/api/http';
import { requireAdmin } from '@/lib/api/guard';
import { isPermissionKey } from '@/lib/permissions';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/roles/:id — admin only. Rename and/or replace the permission set.
export async function PATCH(req: Request, { params }: Params) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const body = await readJson<{ name?: string; permissions?: string[] }>(req);
    if (!body) return badRequest('Invalid JSON body');

    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    if (!role) return notFound('Role not found');
    if (role.isSystem) return badRequest('The Super Admin role cannot be modified.');

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) return badRequest('Role name cannot be empty');
      const all = await db.select().from(roles);
      if (all.some((r) => r.id !== id && r.name.toLowerCase() === name.toLowerCase())) {
        return badRequest('A role with that name already exists');
      }
      await db.update(roles).set({ name }).where(eq(roles.id, id));
    }

    if (body.permissions !== undefined) {
      const perms = body.permissions.filter(isPermissionKey);
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
      if (perms.length) {
        await db.insert(rolePermissions).values(perms.map((permission) => ({ roleId: id, permission })));
      }
    }

    const [updated] = await db.select().from(roles).where(eq(roles.id, id));
    const perms = await db
      .select({ permission: rolePermissions.permission })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, id));
    return ok({
      id: updated.id,
      name: updated.name,
      isSystem: updated.isSystem,
      permissions: perms.map((p) => p.permission),
    });
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/roles/:id — admin only. Blocked for the system role or roles in use.
export async function DELETE(_req: Request, { params }: Params) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    if (!role) return notFound('Role not found');
    if (role.isSystem) return badRequest('The Super Admin role cannot be deleted.');

    const assigned = await db.select({ id: users.id }).from(users).where(eq(users.roleId, id));
    if (assigned.length > 0) {
      return badRequest(`Cannot delete: ${assigned.length} user(s) still have this role. Reassign them first.`);
    }

    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    await db.delete(roles).where(eq(roles.id, id));
    return ok({ id, deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
