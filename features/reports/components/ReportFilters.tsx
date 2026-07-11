import { BarChart3, Printer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Property, AppLanguage } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ReportFilters({
  properties,
  selectedProperty,
  onSelectProperty,
  lang,
}: {
  properties: Property[];
  selectedProperty: string;
  onSelectProperty: (id: string) => void;
  lang: AppLanguage;
}) {
  const t = useTranslations('Reports');
  const tCommon = useTranslations('Common');
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-3xs flex flex-wrap justify-between items-center gap-4">
      <div>
        <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-1.5 font-sans">
          <BarChart3 className="w-5 h-5 text-primary" />
          {tCommon('tab_reports')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 font-sans">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 bg-muted border border-border p-1 px-2.5 rounded-lg text-xs">
          <span className="text-muted-foreground">{t('property_label')}</span>
          <Select value={selectedProperty} onValueChange={onSelectProperty}>
            <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_locations')}</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {lang === 'en' ? p.name : p.nameKh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-muted hover:bg-muted border border-border dark:border-border text-foreground rounded-lg transition cursor-pointer print:hidden"
        >
          <Printer className="w-3.5 h-3.5 text-muted-foreground" />
          {t('print_statement')}
        </button>
      </div>
    </div>
  );
}
