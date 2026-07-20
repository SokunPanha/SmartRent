'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground tracking-tight font-sans">
            {t('buildings_heading')}
          </h2>
          <div className="flex items-center gap-1.5 bg-muted p-1 px-2.5 rounded-lg border border-border text-xs">
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

        {canModify && (
          <button
            onClick={c.openPropModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer justify-center"
            id="open-add-property-modal"
          >
            <Plus className="w-4 h-4" />
            {t('add_property')}
          </button>
        )}
      </div>

      <BuildingGrid
        properties={c.filteredProperties}
        rooms={rooms}
        onOpen={(id) => router.push(`/properties/${id}`)}
        lang={lang}
      />

      <PropertyModal c={c} lang={lang} />
    </div>
  );
}
