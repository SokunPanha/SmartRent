import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, roles, userProperties } from '@/lib/db/schema';
import {
  ok,
  created,
  badRequest,
  serverError,
  readJson,
  missingField,
  genId,
  MIN_PASSWORD_LENGTH,
} from '@/lib/api/http';
import { requireAdmin } from '@/lib/api/guard';

// GET /api/users — admin only. Lists users with their role name (no hashes).
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        nameKh: users.nameKh,
        email: users.email,
        roleId: users.roleId,
        roleName: roles.name,
        isSystemRole: roles.isSystem,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id));

    // Attach each user's assigned building IDs ([] = unrestricted, sees all).
    const assignments = await db.select().from(userProperties);
    const byUser = new Map<string, string[]>();
    for (const a of assignments) {
      const list = byUser.get(a.userId);
      if (list) list.push(a.propertyId);
      else byUser.set(a.userId, [a.propertyId]);
    }
    return ok(rows.map((r) => ({ ...r, propertyIds: byUser.get(r.id) ?? [] })));
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/users — admin only. Creates a user assigned to an existing role.
export async function POST(req: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const missing = missingField(body, ['name', 'email', 'password', 'roleId']);
    if (missing) return badRequest(`Missing required field: ${missing}`);

    if (String(body.password).length < MIN_PASSWORD_LENGTH) {
      return badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    const [role] = await db.select().from(roles).where(eq(roles.id, body.roleId as string));
    if (!role) return badRequest('Selected role does not exist');

    const email = String(body.email).toLowerCase();
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) return badRequest('A user with that email already exists');

    const passwordHash = await bcrypt.hash(String(body.password), 10);
    const [user] = await db
      .insert(users)
      .values({
        id: genId('user'),
        name: body.name as string,
        nameKh: (body.nameKh as string) ?? null,
        email,
        passwordHash,
        roleId: role.id,
      })
      .returning({ id: users.id, name: users.name, email: users.email, roleId: users.roleId });

    // Optional building assignments. Empty/omitted = unrestricted (sees all).
    const propertyIds = Array.isArray(body.propertyIds) ? (body.propertyIds as string[]) : [];
    if (propertyIds.length) {
      await db
        .insert(userProperties)
        .values(propertyIds.map((propertyId) => ({ userId: user.id, propertyId })));
    }

    return created({ ...user, propertyIds });
  } catch (err) {
    return serverError(err);
  }
}
