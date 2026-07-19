import { Skeleton } from '@/components/ui/skeleton';

/**
 * Generic loading placeholder shown while a route's initial data is fetched.
 *
 * Deliberately layout-agnostic — a page header, a row of summary cards and a
 * list/table block — so it reads as a sensible skeleton for any of the
 * management pages (dashboard, tenants, invoices, …) without bespoke variants.
 * Styling follows DESIGN.md: white cards on the ivory canvas, hairline warm
 * borders, the ambient card shadow, and 8px-grid spacing.
 */
export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      {/* Page header: title + primary action */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-(--radius)" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-(--radius-card) border border-border bg-card p-6 shadow-card"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* List / table block */}
      <div className="flex flex-col gap-4 rounded-(--radius-card) border border-border bg-card p-6 shadow-card">
        <Skeleton className="h-5 w-40" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
