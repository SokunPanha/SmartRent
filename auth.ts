import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, roles } from '@/lib/db/schema';
import { authConfig } from './auth.config';

/**
 * Full Auth.js setup (Node runtime). The Credentials provider verifies the
 * password and resolves the user's dynamic role (name + super-admin flag).
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email ? String(credentials.email).toLowerCase() : '';
        const password = credentials?.password ? String(credentials.password) : '';
        if (!email || !password) return null;

        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) return null;

        // Suspended accounts can't sign in (kept, not deleted, for history).
        if (user.active === false) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const [role] = user.roleId
          ? await db.select().from(roles).where(eq(roles.id, user.roleId))
          : [];

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId ?? null,
          role: role?.name ?? '',
          isSuperAdmin: role?.isSystem ?? false,
          preferredLang: user.preferredLang ?? null,
        };
      },
    }),
  ],
});
