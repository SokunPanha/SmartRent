import { X } from 'lucide-react';

/** Title bar with a close button, shared across the app's form modals. */
export function ModalHeader({ title, onClose }: { title: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex justify-between items-center p-4 border-b border-border">
      <h3 className="font-bold text-foreground text-base font-sans">{title}</h3>
      <button
        type="button"
        onClick={onClose}
        className="p-1 hover:bg-muted rounded-sm text-muted-foreground hover:text-muted-foreground cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
