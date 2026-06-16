import { desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { activityLogs } from '@/lib/db/schema';
import { ok, created, badRequest, serverError, readJson, missingField, genId } from '@/lib/api/http';

// GET /api/logs?limit= — activity log, newest first
export async function GET(req: Request) {
  try {
    const limit = Number(new URL(req.url).searchParams.get('limit')) || 100;
    const rows = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/logs — append an activity log entry
export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const missing = missingField(body, ['action', 'actionKh', 'details', 'detailsKh', 'username', 'role']);
    if (missing) return badRequest(`Missing required field: ${missing}`);

    const row = {
      id: (body.id as string) || genId('log'),
      timestamp: (body.timestamp as string) || new Date().toISOString(),
      action: body.action as string,
      actionKh: body.actionKh as string,
      details: body.details as string,
      detailsKh: body.detailsKh as string,
      username: body.username as string,
      role: body.role as string,
    };

    const [inserted] = await db.insert(activityLogs).values(row).returning();
    return created(inserted);
  } catch (err) {
    return serverError(err);
  }
}
