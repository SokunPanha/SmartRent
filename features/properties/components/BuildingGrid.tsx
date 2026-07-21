import { useTranslations } from 'next-intl';
import { MapPin, Building2, ArrowRight } from 'lucide-react';
import { Property, Room, AppLanguage } from '@/lib/types';
import { EmptyState } from '@/components/shared/EmptyState';
import { pickLocale } from '@/lib/i18n';

type PropType = 'apartment' | 'borey' | 'condo' | 'guesthouse';

function typeLabel(type: PropType, t: (k: string) => string): string {
  switch (type) {
    case 'borey':
      return t('type_borey');
    case 'condo':
      return t('type_condo');
    case 'guesthouse':
      return t('type_guesthouse');
    default:
      return t('type_apartment');
  }
}

/** Full-width responsive grid of building cards. Clicking a card opens that
 *  building's room page. */
export function BuildingGrid({
  properties,
  rooms,
  onOpen,
  lang,
  searchActive = false,
}: {
  properties: Property[];
  rooms: Room[];
  onOpen: (propId: string) => void;
  lang: AppLanguage;
  searchActive?: boolean;
}) {
  const t = useTranslations('Properties');

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title={t(searchActive ? 'no_buildings_match_search' : 'no_properties_match_filter')}
        className="p-12 shadow-xs"
      />
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      id="buildings-grid-layout"
    >
      {properties.map((prop) => {
        const propRooms = rooms.filter((r) => r.propertyId === prop.id);
        const occCount = propRooms.filter((r) => r.status === 'occupied').length;

        return (
          <button
            key={prop.id}
            type="button"
            onClick={() => onOpen(prop.id)}
            className="group text-left bg-card border border-border rounded-xl p-5 shadow-3xs flex flex-col gap-3.5 transition hover:border-primary hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold tracking-wide bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-sans">
                {typeLabel(prop.type, t)}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground transition group-hover:text-primary group-hover:translate-x-0.5" />
            </div>

            <div>
              <h4 className="font-bold text-foreground text-base font-sans">
                {pickLocale(lang, prop.name, prop.nameKh)}
              </h4>
              <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1.5 font-sans">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{pickLocale(lang, prop.address, prop.addressKh)}</span>
              </p>
            </div>

            <div className="mt-1 pt-3.5 border-t border-dashed border-border flex justify-between items-center text-xs text-muted-foreground font-sans">
              <span>
                <b className="text-foreground font-semibold">{propRooms.length}</b> {t('room_count')}
              </span>
              <span className="font-semibold text-chart-2 text-[11px] bg-chart-2/10 px-2 py-0.5 rounded-full">
                {occCount} {t('occupied_count_label')}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
