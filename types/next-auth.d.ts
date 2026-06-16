import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    roleId: string | null;
    isSuperAdmin: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      roleId: string | null;
      isSuperAdmin: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    roleId?: string | null;
    isSuperAdmin?: boolean;
  }
}
