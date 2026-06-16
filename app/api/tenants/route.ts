import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { ok, created, badRequest, serverError, readJson, missingField, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

// GET /api/tenants — list all tenants
export async function GET() {
  try {
    const rows = await db.select().from(tenants);
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/tenants — register a tenant
export async function POST(req: Request) {
  const gate = await requirePermission('tenants.manage');
  if (gate instanceof NextResponse) return gate;
  try {
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const missing = missingField(body, ['name', 'nameKh', 'phone', 'nationalId', 'checkInDate', 'emergencyContact']);
    if (missing) return badRequest(`Missing required field: ${missing}`);

    const row = {
      id: (body.id as string) || genId('tenant'),
      name: body.name as string,
      nameKh: body.nameKh as string,
      phone: body.phone as string,
      nationalId: body.nationalId as string,
      email: (body.email as string) ?? null,
      checkInDate: body.checkInDate as string,
      emergencyContact: body.emergencyContact as string,
      telegramChatId: (body.telegramChatId as string) ?? null,
      telegramAutoSend: (body.telegramAutoSend as boolean) ?? null,
    };

    const [inserted] = await db.insert(tenants).values(row).returning();
    return created(inserted);
  } catch (err) {
    return serverError(err);
  }
}
