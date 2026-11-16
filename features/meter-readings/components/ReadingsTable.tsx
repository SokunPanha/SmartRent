import { Lightbulb, Droplet, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MeterReading, Room, Property, AppLanguage } from '@/lib/types';
import { Pagination, usePagination } from '@/components/shared/Pagination';
import {
  MonthOption,
  getRoomNumber,
  getPropertyName,
} from '../meter-readings.helpers';

export function ReadingsTable({
  readings,
  rooms,
  properties,
  monthNames,
  lang,
  canModify = false,
  onEdit,
}: {
  canModify?: boolean;
  onEdit?: (r: MeterReading) => void;
  readings: MeterReading[];
  rooms: Room[];
  properties: Property[];
  monthNames: MonthOption[];
  lang: AppLanguage;
}) {
  const t = useTranslations('MeterReadings');
  const { page, totalPages, pageRows, setPage, pageSize } = usePagination(readings);
  return (
    <div className="bg-card rounded-(--radius-card) border border-(--card-border) overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[55vh] scroll-x-hint">
        <table className="w-full text-left border-collapse" id="utility-readings-ledger-table">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted border-b border-border text-xs font-bold text-muted-foreground font-sans dark:font-mono">
              <th className="p-4 pl-6">{t('room_number')}</th>
              <th className="p-4">{t('billing_cycle')}</th>
              <th className="p-4">
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-chart-1" />
                  {t('electricity_meter_kwh')}
                </span>
              </th>
              <th className="p-4">
                <span className="flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-info" />
                  {t('water_meter_m3')}
                </span>
              </th>
              <th className="p-4">{t('reading_date')}</th>
              <th className="p-4 pr-6">{t('recorded_by')}</th>
              {canModify && onEdit && <th className="p-4 pr-6" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-muted-foreground font-sans">
            {readings.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted-foreground font-sans italic">
                  {t('no_readings_found')}
                </td>
              </tr>
            ) : (
              pageRows.map((r) => {
                const rNum = getRoomNumber(rooms, r.roomId);
                const pName = getPropertyName(rooms, properties, r.roomId, lang);
                const mName = monthNames.find((item) => item.value === r.month)?.label || r.month;
                const elecUsed = r.currElectricityValue - r.prevElectricityValue;
                const waterUsed = r.currWaterValue - r.prevWaterValue;

                return (
                  <tr key={r.id} className="hover:bg-muted/50 transition">
                    <td className="p-4 pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm font-sans">{rNum}</span>
                        <span className="text-[10px] text-muted-foreground font-sans">{pName}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      {mName} / {r.year}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-foreground">
                          {r.prevElectricityValue} ➔{' '}
                          <span className="font-bold text-foreground">{r.currElectricityValue}</span>
                        </div>
                        <span className="text-[10px] font-bold bg-chart-1/10 text-chart-1 px-1.5 py-0.2 rounded-md font-mono">
                          +{elecUsed} kWh
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-foreground">
                          {r.prevWaterValue} ➔{' '}
                          <span className="font-bold text-foreground">{r.currWaterValue}</span>
                        </div>
                        <span className="text-[10px] font-bold bg-info/10 text-info px-1.5 py-0.2 rounded-md font-mono">
                          +{waterUsed} m³
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">{r.readingDate}</td>
                    <td className="p-4 pr-6 shrink-0">
                      <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {r.recordedBy}
                      </span>
                      {r.kind === 'final' && (
                        <span className="ml-1.5 text-xs font-semibold text-destructive">{t('final_reading')}</span>
                      )}
                    </td>
                    {canModify && onEdit && (
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => onEdit(r)}
                          aria-label={t('edit_reading')}
                          title={t('edit_reading')}
                          className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:bg-muted cursor-pointer"
                        >
                          <Pencil className="size-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={readings.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
