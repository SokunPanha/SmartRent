'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from './Modal';

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `destructive` renders the confirm button in the destructive (red) style. */
  variant?: 'default' | 'destructive';
};

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

/**
 * App-wide styled replacement for `window.confirm`. Renders as a themed
 * modal instead of the browser's native (unstyled, blocking) dialog.
 *
 * Usage: `const confirm = useConfirm(); if (await confirm({ title: '...' })) { ... }`
 */
export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmDialogProvider');
  return ctx;
}

type PendingConfirm = { options: ConfirmOptions; resolve: (value: boolean) => void };

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  // A queue, not a single slot: a second confirm() firing before the first is
  // settled (e.g. two rapid delete clicks) must not drop the first caller's
  // promise. Only the head of the queue is shown; settling it advances to the next.
  const [queue, setQueue] = useState<PendingConfirm[]>([]);
  const current = queue[0] ?? null;

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setQueue((q) => [...q, { options: opts, resolve }]);
    });
  }, []);

  function settle(value: boolean) {
    setQueue((q) => {
      q[0]?.resolve(value);
      return q.slice(1);
    });
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={!!current} onClose={() => settle(false)} size="sm">
        {current && (
          <div className="p-5">
            <div className="flex items-start gap-3">
              {current.options.variant === 'destructive' && (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-4.5" />
                </div>
              )}
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="font-heading text-sm font-bold text-foreground">{current.options.title}</h3>
                {current.options.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{current.options.description}</p>
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => settle(false)}>
                {current.options.cancelLabel ?? 'Cancel'}
              </Button>
              <Button
                variant={current.options.variant === 'destructive' ? 'destructive' : 'default'}
                size="sm"
                autoFocus
                onClick={() => settle(true)}
              >
                {current.options.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}
