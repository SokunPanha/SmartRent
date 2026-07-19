'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const SIZE: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Centered modal overlay shared across feature forms (properties, tenants,
 * invoices). Renders nothing when `open` is false. Clicking the backdrop calls
 * `onClose` if provided; clicks inside the panel are not propagated.
 *
 * Handles the standard dialog accessibility contract: `role="dialog"`,
 * Escape-to-close, a focus trap while open, and returning focus to whatever
 * triggered the modal once it closes.
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
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Hold the latest onClose in a ref so the focus-trap effect below can depend
  // on [open] alone. Depending on [onClose] would re-run the effect on every
  // render when a parent passes a fresh onClose each time (e.g. a modal whose
  // form state lives in the parent) — which steals focus/caret back to the
  // first field on every keystroke.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable?.[0] ?? panel)?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;

      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          'flex w-full max-h-[85vh] flex-col overflow-hidden rounded-(--radius-modal) bg-card shadow-(--shadow-modal) outline-none animate-slide-up',
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
