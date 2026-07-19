import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

/**
 * Verify a plaintext password against the stored bcrypt hash for a user id.
 * Used to re-confirm the acting admin before applying sensitive settings
 * changes (exchange rate, utility prices). Returns false for a missing user,
 * empty password, or mismatch — never throws on bad input.
 */
export async function verifyUserPassword(userId: string, password: unknown): Promise<boolean> {
  if (typeof password !== 'string' || password.length === 0) return false;
  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId));
  if (!row) return false;
  return bcrypt.compare(password, row.passwordHash);
}
