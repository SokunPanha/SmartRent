import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contracts, rooms, invoices, meterReadings, activityLogs, invoiceFees } from '@/lib/db/schema';
import { ok, serverError, readJson, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';
import { scopedPropertyIds } from '@/lib/api/scope';
import { resolvePropertyFees, type ResolvedFee } from '@/lib/api/fees';
import { getOrCreateSettings } from '@/lib/api/settings';
import type { Invoice, MeterReading } from '@/lib/types';

/**
 * POST /api/invoices/generate
 * Body (optional): { year?: number, month?: number }  — defaults to the
 * current calendar month when omitted.
 *
 * Generates one invoice per active lease that does not already have an invoice
 * for the target period. When a meter reading for the period is missing, a
 * fallback reading is estimated from the previous month (or sane defaults) and
 * persisted, mirroring the original client-side generator.
 */
export async function POST(req: Request) {
  const gate = await requirePermission('invoices.generate');
  if (gate instanceof NextResponse) return gate;
  try {
    const body = (await readJson<{ year?: number; month?: number }>(req)) ?? {};
    // The client always sends an explicit period (chosen in the generate
    // dialog); these fallbacks default to the current calendar month so a
    // direct/API call without a body still targets a sensible period rather
    // than a hardcoded past one.
    const now = new Date();
    const year = Number(body.year) || now.getFullYear();
    const month = Number(body.month) || now.getMonth() + 1;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const mm = String(month).padStart(2, '0');
    const issueDate = `${year}-${mm}-12`;
    const dueDate = `${year}-${mm}-20`;

    const [activeLeases, existingInvoices, allReadings, allRooms, settings] = await Promise.all([
      db.select().from(contracts).where(eq(contracts.status, 'active')),
      db.select().from(invoices),
      db.select().from(meterReadings),
      db.select().from(rooms),
      getOrCreateSettings(),
    ]);
    const EXCHANGE_RATE = settings.exchangeRateKhr;

    // Only bill leases whose room is in the caller's assigned buildings. A
    // building-scoped staff running the generator produces invoices for their
    // buildings only; unrestricted users (null) bill every active lease.
    const scopeIds = await scopedPropertyIds(gate);
    const scopedRoomIds =
      scopeIds === null
        ? null
        : new Set(allRooms.filter((r) => scopeIds.includes(r.propertyId)).map((r) => r.id));
    const leasesToBill =
      scopedRoomIds === null
        ? activeLeases
        : activeLeases.filter((cnt) => scopedRoomIds.has(cnt.roomId));

    const newInvoices: (typeof invoices.$inferInsert)[] = [];
    const newReadings: (typeof meterReadings.$inferInsert)[] = [];
    const newFeeLines: (typeof invoiceFees.$inferInsert)[] = [];

    // Resolve each building's opted-in flat fees once and reuse across its rooms.
    const feeCache = new Map<string, ResolvedFee[]>();
    async function feesForProperty(propertyId: string): Promise<ResolvedFee[]> {
      const cached = feeCache.get(propertyId);
      if (cached) return cached;
      const resolved = await resolvePropertyFees(propertyId, EXCHANGE_RATE);
      feeCache.set(propertyId, resolved);
      return resolved;
    }

    for (const cnt of leasesToBill) {
      const isDuplicate = existingInvoices.some(
        (inv) => inv.roomId === cnt.roomId && inv.year === year && inv.month === month
      );
      if (isDuplicate) continue;

      const periodReading = allReadings.find(
        (r) => r.roomId === cnt.roomId && r.year === year && r.month === month
      );

      let prevElec = 0;
      let currElec = 0;
      let prevWater = 0;
      let currWater = 0;

      if (periodReading) {
        prevElec = periodReading.prevElectricityValue;
        currElec = periodReading.currElectricityValue;
        prevWater = periodReading.prevWaterValue;
        currWater = periodReading.currWaterValue;
      } else {
        const lastRead = allReadings.find(
          (r) => r.roomId === cnt.roomId && r.year === prevYear && r.month === prevMonth
        );
        if (lastRead) {
          prevElec = lastRead.currElectricityValue;
          currElec = lastRead.currElectricityValue + 80; // estimate +80 kWh
          prevWater = lastRead.currWaterValue;
          currWater = lastRead.currWaterValue + 10; // estimate +10 m3
        } else {
          prevElec = 1000;
          currElec = 1080;
          prevWater = 50;
          currWater = 60;
        }

        const autoReading: MeterReading = {
          id: genId('mr-auto'),
          roomId: cnt.roomId,
          readingDate: issueDate,
          year,
          month,
          prevElectricityValue: prevElec,
          currElectricityValue: currElec,
          prevWaterValue: prevWater,
          currWaterValue: currWater,
          recordedBy: 'AUTO GEN',
        };
        newReadings.push(autoReading);
        allReadings.push(autoReading); // reflect within this run
      }

      const elecCostKHR = (currElec - prevElec) * cnt.electricityRate;
      const waterCostKHR = (currWater - prevWater) * cnt.waterRate;
      const elecCostUSD = Number((elecCostKHR / EXCHANGE_RATE).toFixed(2));
      const waterCostUSD = Number((waterCostKHR / EXCHANGE_RATE).toFixed(2));

      const roomObj = allRooms.find((r) => r.id === cnt.roomId);
      const roomNum = roomObj ? roomObj.roomNumber : 'RM';

      // Building's custom flat fees (trash, parking, …) as extra line items.
      const flatFees = roomObj ? await feesForProperty(roomObj.propertyId) : [];
      const flatFeesUSD = flatFees.reduce((sum, f) => sum + f.amountUSD, 0);

      const totalUSD = cnt.rentAmount + elecCostUSD + waterCostUSD + flatFeesUSD;
      const totalKHR = Math.round(totalUSD * EXCHANGE_RATE);

      const invoiceId = genId('inv');
      for (const f of flatFees) {
        newFeeLines.push({
          id: genId('ifee'),
          invoiceId,
          name: f.name,
          nameKh: f.nameKh,
          amountUSD: f.amountUSD,
          amountKHR: f.amountKHR,
        });
      }

      const newInvoice: Invoice = {
        id: invoiceId,
        invoiceNumber: `INV-${year}-${mm}${roomNum}`,
        contractId: cnt.id,
        roomId: cnt.roomId,
        tenantId: cnt.tenantId,
        year,
        month,
        issueDate,
        dueDate,
        rentAmountUSD: cnt.rentAmount,
        electricityPrev: prevElec,
        electricityCurr: currElec,
        electricityRateKHR: cnt.electricityRate,
        electricityCostKHR: elecCostKHR,
        electricityCostUSD: elecCostUSD,
        waterPrev: prevWater,
        waterCurr: currWater,
        waterRateKHR: cnt.waterRate,
        waterCostKHR: waterCostKHR,
        waterCostUSD: waterCostUSD,
        totalAmountUSD: Number(totalUSD.toFixed(2)),
        totalAmountKHR: totalKHR,
        amountPaidUSD: 0,
        status: 'unpaid',
        khmerExchangeRate: EXCHANGE_RATE,
      };
      newInvoices.push(newInvoice);
    }

    if (newReadings.length) await db.insert(meterReadings).values(newReadings);
    if (newInvoices.length) await db.insert(invoices).values(newInvoices);
    if (newFeeLines.length) await db.insert(invoiceFees).values(newFeeLines);

    if (newInvoices.length) {
      await db.insert(activityLogs).values({
        id: genId('log'),
        timestamp: new Date().toISOString(),
        action: 'Auto-Generated Bills',
        actionKh: 'បានបង្កើតវិក្កយបត្រស្វ័យប្រវត្ត',
        details: `Generated ${newInvoices.length} rental invoices for ${year}-${mm}`,
        detailsKh: `បានបង្កើតឡើងវិក្កយបត្រស្វ័យប្រវត្តិលម្អិតចំនួន ${newInvoices.length} សម្រាប់ ${year}-${mm}`,
        username: 'System',
        role: 'manager',
      });
    }

    return ok({
      generated: newInvoices.length,
      autoReadings: newReadings.length,
      invoices: newInvoices,
    });
  } catch (err) {
    return serverError(err);
  }
}
