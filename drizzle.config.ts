import { readFileSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

/**
 * Load DATABASE_URL from the environment, falling back to parsing `.env.local`
 * (drizzle-kit does not read `.env.local` automatically).
 */
function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const file of ['.env.local', '.env']) {
    try {
      const content = readFileSync(file, 'utf8');
      const match = content.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
      if (match) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    } catch {
      // file missing — try next
    }
  }
  throw new Error('DATABASE_URL not found in env or .env.local');
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: resolveDatabaseUrl(),
  },
  verbose: true,
  strict: true,
});
