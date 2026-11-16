import { cn } from '@/lib/utils';

/** Cancel/submit button pair shared across the app's form modals. */
export function ModalFooter({
  cancelLabel,
  onCancel,
  submitLabel,
  submitDisabled,
}: {
  cancelLabel: string;
  onCancel: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
  /** Retained for call-site compatibility; all submit buttons now follow the
   *  active theme accent rather than a fixed green. */
  tone?: 'primary' | 'success';
}) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 rounded-sm text-sm border border-border hover:bg-muted transition cursor-pointer font-sans"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={submitDisabled}
        className={cn(
          'flex-1 py-2.5 rounded-sm text-sm transition font-semibold cursor-pointer font-sans disabled:opacity-40 disabled:cursor-not-allowed',
          'bg-primary hover:bg-primary/90 text-primary-foreground'
        )}
      >
        {submitLabel}
      </button>
    </div>
  );
}
