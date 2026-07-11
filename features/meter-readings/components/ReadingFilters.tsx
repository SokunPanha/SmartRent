import { Plus, Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Property, UserRole, AppLanguage } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonthOption } from '../meter-readings.helpers';

export function RoleBanner({
  activeRole,
  lang,
}: {
  activeRole: UserRole;
  lang: AppLanguage;
}) {
  const t = useTranslations('MeterReadings');
  const tCommon = useTranslations('Common');
  return (
    <div className="bg-chart-1/10 border border-chart-1/30 text-chart-1 rounded-xl p-3 text-xs flex items-center gap-2 font-sans">
      <Briefcase className="w-4 h-4 text-chart-1 hover:rotate-12 transition shrink-0" />
      <div>
        <span className="font-bold">
          {tCommon('read_only_access')}
        </span>
        {t('read_only_banner_detail', { role: activeRole.toUpperCase() })}
      </div>
    </div>
  );
}

export function ReadingFilters({
  properties,
  monthNames,
  selectedPropId,
  onSelectProp,
  selectedMonth,
  onSelectMonth,
  canModify,
  onRecord,
  lang,
}: {
  properties: Property[];
  monthNames: MonthOption[];
  selectedPropId: string;
  onSelectProp: (id: string) => void;
  selectedMonth: string;
  onSelectMonth: (m: string) => void;
  canModify: boolean;
  onRecord: () => void;
  lang: AppLanguage;
}) {
  const t = useTranslations('MeterReadings');
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-3xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{t('property_label')}</span>
          <Select value={selectedPropId} onValueChange={onSelectProp}>
            <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_properties')}</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {lang === 'en' ? p.name : p.nameKh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{t('month_label')}</span>
          <Select value={selectedMonth} onValueChange={onSelectMonth}>
            <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_months')}</SelectItem>
              {monthNames.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {canModify && (
        <button
          onClick={onRecord}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-chart-2 text-white rounded-lg hover:bg-chart-2/90 transition cursor-pointer self-stretch md:self-auto justify-center"
          id="open-record-reading-btn"
        >
          <Plus className="w-4 h-4" />
          {t('record_reading')}
        </button>
      )}
    </div>
  );
}
