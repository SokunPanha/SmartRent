import { cn } from '@/lib/utils';

/** Cancel/submit button pair shared across the app's form modals. */
export function ModalFooter({
  cancelLabel,
  onCancel,
  submitLabel,
  submitDisabled,
  tone = 'primary',
}: {
  cancelLabel: string;
  onCancel: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
  /** 'success' is used for money/data-recording actions (record payment, record reading). */
  tone?: 'primary' | 'success';
}) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2 rounded-sm text-sm border border-border hover:bg-muted transition cursor-pointer font-sans"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={submitDisabled}
        className={cn(
          'flex-1 py-2 rounded-sm text-sm transition font-semibold cursor-pointer font-sans disabled:opacity-40 disabled:cursor-not-allowed',
          tone === 'success'
            ? 'bg-chart-2 hover:bg-chart-2/90 text-secondary-foreground'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        )}
      >
        {submitLabel}
      </button>
    </div>
  );
}
