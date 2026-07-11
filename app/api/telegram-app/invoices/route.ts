import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { ok, serverError } from '@/lib/api/http';
import { requireLinkedTenant } from '@/lib/api/telegram-auth';

// GET /api/telegram-app/invoices — the connected tenant's own invoices only.
export async function GET(req: NextRequest) {
  try {
    const tenant = await requireLinkedTenant(req.headers.get('x-telegram-init-data'));
    if (tenant instanceof NextResponse) return tenant;

    const rows = await db
      .select()
      .from(invoices)
      .where(eq(invoices.tenantId, tenant.id))
      .orderBy(desc(invoices.issueDate));
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}
