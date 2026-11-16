'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Search } from 'lucide-react';
import { Property, Room, UserRole, AppLanguage } from '@/lib/types';
import { PermissionBanner } from '@/components/shared/PermissionBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCan } from '@/features/admin/permissions.queries';
import { useBuildingsController } from './use-buildings-controller';
import { BuildingGrid } from './components/BuildingGrid';
import { PropertyModal } from './components/PropertyModal';

type PropType = 'apartment' | 'borey' | 'condo' | 'guesthouse';

interface BuildingsViewProps {
  properties: Property[];
  rooms: Room[];
  activeRole: UserRole;
  lang: AppLanguage;
  onAddProperty: (prop: Omit<Property, 'totalRooms'>) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** Landing view for /properties: the buildings card grid + "add building". */
export default function BuildingsView({
  properties,
  rooms,
  activeRole,
  lang,
  onAddProperty,
  logAction,
}: BuildingsViewProps) {
  const t = useTranslations('Properties');
  const router = useRouter();
  const can = useCan();
  const canModify = can('properties.manage');

  const c = useBuildingsController({ properties, canModify, onAddProperty, logAction });

  return (
    <div className="space-y-6" id="buildings-container">
      {!canModify && (
        <PermissionBanner message={t('cannot_modify_persona', { role: activeRole.toUpperCase() })} />
      )}

      <div className="@container sticky top-16 md:top-20 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-background/85 backdrop-blur-md">
        <div className="flex flex-col @3xl:flex-row @3xl:items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight font-sans">
              {t('buildings_heading')}
            </h2>
            <div className="flex h-10 items-center gap-1.5 bg-card px-4 rounded-full border border-(--card-border) shadow-card text-xs">
              <span className="text-muted-foreground font-sans">{t('type_filter_label')}</span>
              <Select
                value={c.propertyTypeFilter}
                onValueChange={(v) => c.setPropertyTypeFilter(v as 'all' | PropType)}
              >
                <SelectTrigger className="w-fit data-[size=default]:h-auto gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_types')}</SelectItem>
                  <SelectItem value="apartment">{t('type_apartment')}</SelectItem>
                  <SelectItem value="borey">{t('type_borey')}</SelectItem>
                  <SelectItem value="condo">{t('type_condo')}</SelectItem>
                  <SelectItem value="guesthouse">{t('type_guesthouse')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 sm:gap-3 @3xl:w-auto">
            <div className="relative min-w-0 flex-1 @3xl:flex-none">
              <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={c.buildingSearch}
                onChange={(e) => c.setBuildingSearch(e.target.value)}
                placeholder={t('search_placeholder')}
                className="h-11 w-full @3xl:w-64 pl-10 pr-4 rounded-full border border-(--card-border) text-sm bg-card text-foreground shadow-card font-sans focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                id="building-search-input"
              />
            </div>

            {canModify && (
              <button
                onClick={c.openPropModal}
                className="flex h-10 items-center gap-1.5 px-4 text-sm font-semibold bg-primary text-primary-foreground rounded-full shadow-[0_6px_16px_-6px_var(--primary)] hover:bg-primary/90 transition cursor-pointer justify-center shrink-0"
                id="open-add-property-modal"
              >
                <Plus className="w-4 h-4" />
                {t('add_property')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="@container">
      <BuildingGrid
        properties={c.filteredProperties}
        rooms={rooms}
        onOpen={(id) => router.push(`/properties/${id}`)}
        lang={lang}
        searchActive={c.buildingSearch.trim().length > 0}
      />
      </div>

      <PropertyModal c={c} lang={lang} />
    </div>
  );
}
