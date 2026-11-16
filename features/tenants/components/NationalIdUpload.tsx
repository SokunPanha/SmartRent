'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePlus, Loader2, Maximize2, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downscaleImage } from '@/lib/image';
import { tenantsApi } from '../tenants.api';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif';

/**
 * One national-ID photo slot (front or back). Picking a file uploads it right
 * away (after shrinking it in the browser) and reports the server's storage
 * key through `onChange`. `existingSrc` shows a photo already on file.
 */
export function NationalIdUpload({
  label,
  value,
  onChange,
  existingSrc,
  onUploadingChange,
  invalid = false,
  disabled = false,
}: {
  label: string;
  value: string | null;
  onChange: (key: string | null) => void;
  existingSrc?: string | null;
  onUploadingChange?: (uploading: boolean) => void;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations('Tenants');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Release the object URL when it's replaced or the slot unmounts.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const blob = await downscaleImage(file);
      const key = await tenantsApi.uploadNationalIdImage(blob);
      setLocalPreview(URL.createObjectURL(blob));
      onChange(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('id_upload_failed'));
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  // A local preview only counts while the parent still holds a key, so a
  // form reset (value → null) clears the slot without extra state syncing.
  const shownLocal = value ? localPreview : null;
  const preview = shownLocal ?? existingSrc ?? null;
  const pick = () => inputRef.current?.click();

  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-bold text-muted-foreground font-sans">
        {label}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div
        className={cn(
          'relative aspect-[1.586] w-full overflow-hidden rounded-2xl border-2 border-dashed bg-muted/50 transition',
          invalid && !preview ? 'border-destructive/60' : 'border-border',
          !preview && !disabled && 'hover:border-primary/50 hover:bg-accent/50'
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- authenticated API image, not optimizable */}
            <img src={preview} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/55 to-transparent p-2">
              {existingSrc && !shownLocal && (
                <a
                  href={existingSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-[#1B1C20] hover:bg-white"
                  aria-label={t('id_view_full')}
                  title={t('id_view_full')}
                >
                  <Maximize2 className="size-4" />
                </a>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={pick}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-white/90 px-3 text-xs font-semibold text-[#1B1C20] hover:bg-white cursor-pointer"
                >
                  <RefreshCw className="size-3.5" />
                  {t('id_replace')}
                </button>
              )}
              {!disabled && value && !existingSrc && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalPreview(null);
                    onChange(null);
                  }}
                  className="inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-destructive hover:bg-white cursor-pointer"
                  aria-label={t('id_remove')}
                  title={t('id_remove')}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={pick}
            disabled={disabled || uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-3 text-center text-muted-foreground cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <ImagePlus className="size-5" />
            </span>
            <span className="text-xs font-semibold text-foreground">{t('id_upload_cta')}</span>
            <span className="text-[11px] leading-tight">{t('id_upload_hint')}</span>
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-card/80 text-xs font-semibold text-foreground backdrop-blur-sm">
            <Loader2 className="size-4 animate-spin text-primary" />
            {t('id_uploading')}
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
