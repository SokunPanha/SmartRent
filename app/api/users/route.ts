import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, roles } from '@/lib/db/schema';
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
    return ok(rows);
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

    return created(user);
  } catch (err) {
    return serverError(err);
  }
}
