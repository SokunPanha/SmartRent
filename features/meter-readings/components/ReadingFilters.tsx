import { Plus, Briefcase } from 'lucide-react';
import { Property, UserRole, AppLanguage } from '@/lib/types';
import { MonthOption } from '../meter-readings.helpers';

export function RoleBanner({
  activeRole,
  lang,
}: {
  activeRole: UserRole;
  lang: AppLanguage;
}) {
  return (
    <div className="bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center gap-2 font-sans">
      <Briefcase className="w-4 h-4 text-amber-500 hover:rotate-12 transition shrink-0" />
      <div>
        <span className="font-bold">
          {lang === 'en' ? 'READ-ONLY ACCESS - ' : 'សិទ្ធិមើលតែប៉ុណ្ណោះ - '}
        </span>
        {lang === 'en'
          ? `${activeRole.toUpperCase()} persona cannot record meter readings. Switch roles to authorize.`
          : `តួនាទីជាប្រព័ន្ធ ${activeRole.toUpperCase()} មិនអនុញ្ញាតឱ្យកត់លេខត្រាកុងទ័រទេ។ សូមផ្លាស់ប្តូរទៅកាន់ Owner, Manager ឬ Staff។`}
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
  t,
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
  t: any;
  lang: AppLanguage;
}) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-3xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{lang === 'en' ? 'Property:' : 'ទីតាំង៖'}</span>
          <select
            value={selectedPropId}
            onChange={(e) => onSelectProp(e.target.value)}
            className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">{lang === 'en' ? 'All Properties' : 'គ្រប់ទីតាំងទាំងអស់'}</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {lang === 'en' ? p.name : p.nameKh}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
          <span className="text-muted-foreground font-sans">{lang === 'en' ? 'Month:' : 'ខែ៖'}</span>
          <select
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">{lang === 'en' ? 'All Months' : 'គ្រប់ខែទាំងអស់'}</option>
            {monthNames.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {canModify && (
        <button
          onClick={onRecord}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer self-stretch md:self-auto justify-center"
          id="open-record-reading-btn"
        >
          <Plus className="w-4 h-4" />
          {t.record_reading}
        </button>
      )}
    </div>
  );
}
