import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { fees, propertyFees } from '@/lib/db/schema';

export interface ResolvedFee {
  feeId: string;
  name: string;
  nameKh: string;
  currency: string; // 'USD' | 'KHR'
  amountUSD: number;
  amountKHR: number;
}

/**
 * The flat fees a building charges (opt-in via `propertyFees`), with each
 * amount resolved to both USD and KHR using the given exchange rate. Skips
 * globally-inactive fees. A `propertyFees.amount` override wins over the
 * catalog default.
 */
export async function resolvePropertyFees(
  propertyId: string,
  exchangeRateKhr: number
): Promise<ResolvedFee[]> {
  const rows = await db
    .select({
      feeId: fees.id,
      name: fees.name,
      nameKh: fees.nameKh,
      defaultAmount: fees.amount,
      currency: fees.currency,
      active: fees.active,
      override: propertyFees.amount,
    })
    .from(propertyFees)
    .innerJoin(fees, eq(propertyFees.feeId, fees.id))
    .where(eq(propertyFees.propertyId, propertyId));

  return rows
    .filter((r) => r.active)
    .map((r) => {
      const amount = r.override ?? r.defaultAmount;
      const amountUSD =
        r.currency === 'KHR'
          ? Number((amount / exchangeRateKhr).toFixed(2))
          : Number(amount.toFixed(2));
      const amountKHR =
        r.currency === 'KHR' ? Math.round(amount) : Math.round(amount * exchangeRateKhr);
      return { feeId: r.feeId, name: r.name, nameKh: r.nameKh, currency: r.currency, amountUSD, amountKHR };
    });
}
