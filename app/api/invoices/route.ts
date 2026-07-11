import { NextResponse } from 'next/server';
import { and, eq, desc, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { ok, created, badRequest, serverError, readJson, missingField, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';

// GET /api/invoices?status=&month=&year= — list invoices, newest first
export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const filters: SQL[] = [];
    const status = sp.get('status');
    const month = sp.get('month');
    const year = sp.get('year');
    if (status && status !== 'all') filters.push(eq(invoices.status, status));
    if (month && month !== 'all') filters.push(eq(invoices.month, Number(month)));
    if (year && year !== 'all') filters.push(eq(invoices.year, Number(year)));

    const rows = await db
      .select()
      .from(invoices)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(invoices.issueDate));
    return ok(rows);
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/invoices — create a single invoice with caller-provided figures.
// (For the monthly bulk run, use POST /api/invoices/generate.)
export async function POST(req: Request) {
  const gate = await requirePermission('invoices.generate');
  if (gate instanceof NextResponse) return gate;
  try {
    const body = await readJson(req);
    if (!body) return badRequest('Invalid JSON body');

    const missing = missingField(body, [
      'invoiceNumber', 'contractId', 'roomId', 'tenantId', 'year', 'month',
      'issueDate', 'dueDate', 'rentAmountUSD', 'totalAmountUSD', 'totalAmountKHR', 'khmerExchangeRate',
    ]);
    if (missing) return badRequest(`Missing required field: ${missing}`);

    const row = {
      id: (body.id as string) || genId('inv'),
      invoiceNumber: body.invoiceNumber as string,
      contractId: body.contractId as string,
      roomId: body.roomId as string,
      tenantId: body.tenantId as string,
      year: body.year as number,
      month: body.month as number,
      issueDate: body.issueDate as string,
      dueDate: body.dueDate as string,
      rentAmountUSD: body.rentAmountUSD as number,
      electricityPrev: (body.electricityPrev as number) ?? 0,
      electricityCurr: (body.electricityCurr as number) ?? 0,
      electricityRateKHR: (body.electricityRateKHR as number) ?? 0,
      electricityCostKHR: (body.electricityCostKHR as number) ?? 0,
      electricityCostUSD: (body.electricityCostUSD as number) ?? 0,
      waterPrev: (body.waterPrev as number) ?? 0,
      waterCurr: (body.waterCurr as number) ?? 0,
      waterRateKHR: (body.waterRateKHR as number) ?? 0,
      waterCostKHR: (body.waterCostKHR as number) ?? 0,
      waterCostUSD: (body.waterCostUSD as number) ?? 0,
      totalAmountUSD: body.totalAmountUSD as number,
      totalAmountKHR: body.totalAmountKHR as number,
      amountPaidUSD: (body.amountPaidUSD as number) ?? 0,
      status: (body.status as string) || 'unpaid',
      khmerExchangeRate: body.khmerExchangeRate as number,
      paidDate: (body.paidDate as string) ?? null,
      paymentMethod: (body.paymentMethod as string) ?? null,
      notes: (body.notes as string) ?? null,
      telegramScheduledDate: (body.telegramScheduledDate as string) ?? null,
      telegramSentDate: (body.telegramSentDate as string) ?? null,
      telegramStatus: (body.telegramStatus as string) ?? null,
      telegramError: (body.telegramError as string) ?? null,
    };

    const [inserted] = await db.insert(invoices).values(row).returning();
    return created(inserted);
  } catch (err) {
    return serverError(err);
  }
}
