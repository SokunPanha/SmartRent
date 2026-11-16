import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Icon-only trash button used for row/card-level delete actions across feature tables. */
export function DeleteButton({
  onClick,
  title,
  disabled,
  size = 'sm',
  className,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground',
        size === 'sm' ? 'p-1' : 'p-1.5',
        className
      )}
    >
      <Trash2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
    </button>
  );
}
