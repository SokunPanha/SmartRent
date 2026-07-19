import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, roles, userProperties } from '@/lib/db/schema';
import { ok, notFound, badRequest, serverError, readJson, MIN_PASSWORD_LENGTH } from '@/lib/api/http';
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
    if (body.password) {
      if (String(body.password).length < MIN_PASSWORD_LENGTH) {
        return badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      }
      patch.passwordHash = await bcrypt.hash(String(body.password), 10);
    }

    const hasPropertyIds = Array.isArray(body.propertyIds);
    if (Object.keys(patch).length === 0 && !hasPropertyIds) {
      return badRequest('No updatable fields provided');
    }

    let updated =
      Object.keys(patch).length > 0
        ? (
            await db
              .update(users)
              .set(patch)
              .where(eq(users.id, id))
              .returning({ id: users.id, name: users.name, email: users.email, roleId: users.roleId })
          )[0]
        : { id: existing.id, name: existing.name, email: existing.email, roleId: existing.roleId };

    // Replace building assignments wholesale when provided ([] = unrestricted).
    if (hasPropertyIds) {
      const propertyIds = body.propertyIds as string[];
      await db.delete(userProperties).where(eq(userProperties.userId, id));
      if (propertyIds.length) {
        await db.insert(userProperties).values(propertyIds.map((propertyId) => ({ userId: id, propertyId })));
      }
      updated = { ...updated, ...(propertyIds ? { propertyIds } : {}) };
    }

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
