import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contracts, rooms, invoices, meterReadings, activityLogs } from '@/lib/db/schema';
import { ok, serverError, readJson, genId } from '@/lib/api/http';
import { requirePermission } from '@/lib/api/guard';
import type { Invoice, MeterReading } from '@/lib/types';

const EXCHANGE_RATE = 4100;

/**
 * POST /api/invoices/generate
 * Body (optional): { year?: number, month?: number }  — defaults to 2026-06.
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
    const year = Number(body.year) || 2026;
    const month = Number(body.month) || 6;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const mm = String(month).padStart(2, '0');
    const issueDate = `${year}-${mm}-12`;
    const dueDate = `${year}-${mm}-20`;

    const [activeLeases, existingInvoices, allReadings, allRooms] = await Promise.all([
      db.select().from(contracts).where(eq(contracts.status, 'active')),
      db.select().from(invoices),
      db.select().from(meterReadings),
      db.select().from(rooms),
    ]);

    const newInvoices: (typeof invoices.$inferInsert)[] = [];
    const newReadings: (typeof meterReadings.$inferInsert)[] = [];

    for (const cnt of activeLeases) {
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
      const totalUSD = cnt.rentAmount + elecCostUSD + waterCostUSD;
      const totalKHR = Math.round(totalUSD * EXCHANGE_RATE);

      const roomObj = allRooms.find((r) => r.id === cnt.roomId);
      const roomNum = roomObj ? roomObj.roomNumber : 'RM';

      const newInvoice: Invoice = {
        id: genId('inv'),
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
