import { db } from '@/lib/db';
import { systemSettings } from '@/lib/db/schema';

const SETTINGS_ID = 'global';

/**
 * Reads the single system-settings row, inserting the default row on first
 * access instead of requiring a seed step (this table didn't exist before
 * the utility-pricing feature, so existing databases won't have it yet).
 */
export async function getOrCreateSettings() {
  const [existing] = await db.select().from(systemSettings);
  if (existing) return existing;

  const [inserted] = await db
    .insert(systemSettings)
    .values({ id: SETTINGS_ID })
    .returning();
  return inserted;
}
