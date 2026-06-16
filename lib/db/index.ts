import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * Shared Postgres connection pool + Drizzle client.
 *
 * The pool is cached on `globalThis` in development so Next.js hot-reloads do
 * not exhaust connections by creating a new pool on every module re-evaluation.
 */
const globalForDb = globalThis as unknown as {
  __pgPool?: Pool;
};

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. See .env.example.');
  }
  if (!globalForDb.__pgPool) {
    globalForDb.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return globalForDb.__pgPool;
}

export const db = drizzle(getPool(), { schema });
export { schema };
