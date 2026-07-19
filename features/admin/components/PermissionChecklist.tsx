'use client';

import { PERMISSION_META, PermissionKey } from '@/lib/permissions';

/** The full list of grantable permissions as toggleable checkboxes. */
export function PermissionChecklist({
  selected,
  onToggle,
  disabled,
}: {
  selected: Set<PermissionKey>;
  onToggle: (key: PermissionKey) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      {PERMISSION_META.map((perm) => (
        <label
          key={perm.key}
          className={`flex items-start gap-2.5 ${disabled ? 'opacity-70' : 'cursor-pointer'}`}
        >
          <input
            type="checkbox"
            checked={selected.has(perm.key)}
            disabled={disabled}
            onChange={() => onToggle(perm.key)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
          />
          <span>
            <span className="block text-xs font-semibold text-foreground">{perm.label}</span>
            <span className="block text-[11px] text-muted-foreground">{perm.description}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
