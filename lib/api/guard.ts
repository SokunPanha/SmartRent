import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { rolePermissions } from '@/lib/db/schema';
import { PermissionKey } from '@/lib/permissions';
import { NextResponse } from 'next/server';

type SessionUser = {
  id: string;
  role: string;
  roleId: string | null;
  isSuperAdmin: boolean;
  name?: string | null;
  email?: string | null;
};

/**
 * Route-handler auth guards. Each returns either the session user or a
 * ready-to-send error response:
 *
 *   const gate = await requirePermission('properties.manage');
 *   if (gate instanceof NextResponse) return gate;
 *   // gate is the authenticated user
 */
export async function requireUser(): Promise<SessionUser | NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session.user as SessionUser;
}

/** True when the user's role grants `permission` (super admins always pass). */
async function roleHasPermission(user: SessionUser, permission: PermissionKey): Promise<boolean> {
  if (user.isSuperAdmin) return true;
  if (!user.roleId) return false;
  const [row] = await db
    .select({ permission: rolePermissions.permission })
    .from(rolePermissions)
    .where(and(eq(rolePermissions.roleId, user.roleId), eq(rolePermissions.permission, permission)));
  return !!row;
}

export async function requirePermission(
  permission: PermissionKey
): Promise<SessionUser | NextResponse> {
  const result = await requireUser();
  if (result instanceof NextResponse) return result;
  if (await roleHasPermission(result, permission)) return result;
  return NextResponse.json(
    { error: `Forbidden: missing permission "${permission}"` },
    { status: 403 }
  );
}

/** Gate for the admin area (user / role management). */
export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  return requirePermission('admin.access');
}

/** Boolean permission check for use in server components / page guards. */
export async function userCan(permission: PermissionKey): Promise<boolean> {
  const result = await requireUser();
  if (result instanceof NextResponse) return false;
  return roleHasPermission(result, permission);
}
