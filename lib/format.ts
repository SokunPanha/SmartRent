/**
 * Shared currency / number formatting helpers.
 *
 * Previously each feature re-declared its own `formatUSD` / `formatKHR`; these
 * are the single source of truth. The Cambodia market uses a fixed USD↔KHR peg.
 */

export const USD_KHR_RATE = 4100;

/** Convert a USD amount to Khmer Riel using the fixed peg. */
export function usdToKhr(usd: number): number {
  return Math.round(usd * USD_KHR_RATE);
}

/** Format a USD amount, e.g. `formatUSD(1234.5)` → "$1,234.50". */
export function formatUSD(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Format a Riel amount (already in KHR), e.g. "16,400 ៛". */
export function formatKHR(khrValue: number): string {
  return new Intl.NumberFormat('km-KH', { style: 'decimal' }).format(khrValue) + ' ៛';
}

/** Convert a USD amount to Riel and format it, e.g. "5,000,000 ៛". */
export function formatKHRFromUSD(usdValue: number): string {
  return formatKHR(usdToKhr(usdValue));
}
