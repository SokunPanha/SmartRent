/**
 * Shared currency / number formatting helpers.
 *
 * Previously each feature re-declared its own `formatUSD` / `formatKHR`; these
 * are the single source of truth. The Cambodia market uses a fixed USD↔KHR peg.
 */

export const USD_KHR_RATE = 4100;

// The effective rate used by `usdToKhr`/`formatKHRFromUSD`. Defaults to the
// fixed peg above and is updated once at app startup from the configurable
// system setting (see `setUsdKhrRate` / features/settings). Kept as a mutable
// module-level value (rather than threading a rate prop through every call
// site) since these are pure display-formatting helpers used all over the UI.
let currentUsdKhrRate = USD_KHR_RATE;

export function setUsdKhrRate(rate: number): void {
  if (Number.isFinite(rate) && rate > 0) currentUsdKhrRate = rate;
}

/** Convert a USD amount to Khmer Riel using the current exchange rate. */
export function usdToKhr(usd: number): number {
  return Math.round(usd * currentUsdKhrRate);
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
