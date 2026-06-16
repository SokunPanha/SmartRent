import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, roles } from '@/lib/db/schema';
import { ok, notFound, badRequest, serverError, readJson } from '@/lib/api/http';
import { requireAdmin } from '@/lib/api/guard';

type Params = { params: Promise<{ id: string }> };

async function systemRoleIds(): Promise<string[]> {
  const rows = await db.select({ id: roles.id }).from(roles).where(eq(roles.isSystem, true));
  return rows.map((r) => r.id);
}

async function countSuperAdmins(sysIds: string[]): Promise<number> {
  if (sysIds.length === 0) return 0;
  const rows = await db.select({ id: users.id }).from(users).where(inArray(users.roleId, sysIds));
  return rows.length;
}

// PATCH /api/users/:id — admin only. Update name / nameKh / role / password.
export async function PATCH(req: Request, { params }: Params) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) return notFound('User not found');

    const patch: Record<string, unknown> = {};

    if (body.roleId !== undefined) {
      const [role] = await db.select().from(roles).where(eq(roles.id, body.roleId as string));
      if (!role) return badRequest('Selected role does not exist');
      // Don't allow moving the last super admin off the system role.
      const sysIds = await systemRoleIds();
      const wasSuper = existing.roleId ? sysIds.includes(existing.roleId) : false;
      if (wasSuper && !role.isSystem && (await countSuperAdmins(sysIds)) <= 1) {
        return badRequest('At least one Super Admin must remain.');
      }
      patch.roleId = role.id;
    }

    if (body.name !== undefined) patch.name = body.name;
    if (body.nameKh !== undefined) patch.nameKh = body.nameKh;
    if (body.password) patch.passwordHash = await bcrypt.hash(String(body.password), 10);

    if (Object.keys(patch).length === 0) return badRequest('No updatable fields provided');

    const [updated] = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, id))
      .returning({ id: users.id, name: users.name, email: users.email, roleId: users.roleId });
    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/users/:id — admin only. Cannot delete self or the last super admin.
export async function DELETE(_req: Request, { params }: Params) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const { id } = await params;
    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) return notFound('User not found');
    if (id === gate.id) return badRequest('You cannot delete your own account.');

    const sysIds = await systemRoleIds();
    const isSuper = existing.roleId ? sysIds.includes(existing.roleId) : false;
    if (isSuper && (await countSuperAdmins(sysIds)) <= 1) {
      return badRequest('Cannot delete the last remaining Super Admin.');
    }

    await db.delete(users).where(eq(users.id, id));
    return ok({ id, deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
