'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

const DEFAULT_PAGE_SIZE = 10;

/**
 * Pages are clamped against the current row count on every render (rather than
 * reset via an effect keyed on array identity), since several callers rebuild
 * their filtered arrays on every render — reference-equality resets would
 * otherwise snap back to page 1 on unrelated re-renders.
 */
export function usePagination<T>(rows: T[], pageSize: number = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  return { page: currentPage, totalPages, pageRows, setPage, pageSize };
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations('Common');
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-border text-xs text-muted-foreground font-sans">
      <span>{t('pagination_showing', { start, end, total: totalItems })}</span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('pagination_prev')}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        <span className="px-2 font-semibold text-foreground font-mono">
          {t('pagination_page', { page, totalPages })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('pagination_next')}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
