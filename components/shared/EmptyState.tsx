import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Placeholder shown when a list/grid has no data. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-16 text-center shadow-3xs',
        className
      )}
    >
      {Icon && <Icon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />}
      <p className="font-bold text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
