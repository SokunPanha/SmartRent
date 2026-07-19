import { cn } from '@/lib/utils';

const TONE_STYLES = {
  success: 'bg-chart-2/10 border-chart-2/20 text-chart-2',
  warning: 'bg-chart-1/10 border-chart-1/20 text-chart-1',
  danger: 'bg-destructive/10 border-destructive/20 text-destructive',
  info: 'bg-info/10 border-info/20 text-info',
} as const;

export type StatusBadgeTone = keyof typeof TONE_STYLES;

/** Small pill used across feature tables/grids to show a status (invoice, contract, room, etc.). */
export function StatusBadge({
  tone,
  pulse,
  className,
  children,
}: {
  tone: StatusBadgeTone;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'text-xs font-semibold px-2 py-0.5 rounded-md border',
        TONE_STYLES[tone],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );
}
