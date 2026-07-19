import { useTranslations } from 'next-intl';
import { AppLanguage } from '@/lib/types';
import { Pagination, usePagination } from '@/components/shared/Pagination';
import { RoomRevenueRow } from '../reports.helpers';

export function RoomRevenueTable({
  rows,
  lang,
}: {
  rows: RoomRevenueRow[];
  lang: AppLanguage;
}) {
  const t = useTranslations('Reports');
  const { page, totalPages, pageRows, setPage, pageSize } = usePagination(rows);
  return (
    <div
      className="lg:col-span-12 bg-card rounded-(--radius-card) border border-border overflow-hidden"
      id="room-revenue-drilldown"
    >
      <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-sans dark:font-mono">
          {t('room_income_title')}
        </h4>
        <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
          {t('room_income_ordered_note')}
        </span>
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[55vh] scroll-x-hint">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted border-b border-border text-[10px] font-bold text-muted-foreground uppercase font-sans dark:font-mono">
              <th className="p-4 pl-6">{t('room_number')}</th>
              <th className="p-4">{t('location_property')}</th>
              <th className="p-4 text-right font-bold text-chart-2">
                {t('deposited_total')}
              </th>
              <th className="p-4 text-right text-destructive">
                {t('outstanding')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-sans text-muted-foreground">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted-foreground italic">
                  {t('no_room_history')}
                </td>
              </tr>
            ) : (
              pageRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/50 transition">
                  <td className="p-4 pl-6 font-bold text-foreground font-mono">{row.roomNumber}</td>
                  <td className="p-4 text-muted-foreground font-sans text-xs">{row.propertyName}</td>
                  <td className="p-4 text-right font-black text-chart-2 font-mono">
                    ${row.totalPaid.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold font-mono text-muted-foreground">
                    {row.totalOwed > 0 ? (
                      <span className="text-destructive">${row.totalOwed.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground">$0.00</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={rows.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
