'use client';

import { cn } from '@/lib/utils';

const SIZE: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

/**
 * Centered modal overlay shared across feature forms (properties, tenants,
 * invoices). Renders nothing when `open` is false. Clicking the backdrop calls
 * `onClose` if provided; clicks inside the panel are not propagated.
 */
export function Modal({
  open,
  onClose,
  size = 'md',
  className,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  size?: keyof typeof SIZE;
  className?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          'flex w-full max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-card shadow-xl animate-slide-up',
          SIZE[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
