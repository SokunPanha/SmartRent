import { Plus, MapPin, Building2, Trash2 } from 'lucide-react';
import { Property, Room, AppLanguage } from '@/lib/types';

export function PropertyList({
  properties,
  rooms,
  selectedPropId,
  onSelect,
  canModify,
  onAddClick,
  onDeleteProp,
  t,
  lang,
}: {
  properties: Property[];
  rooms: Room[];
  selectedPropId: string;
  onSelect: (id: string) => void;
  canModify: boolean;
  onAddClick: () => void;
  onDeleteProp: (id: string, name: string, nameKh: string) => void;
  t: any;
  lang: AppLanguage;
}) {
  return (
    <div className="md:col-span-1 space-y-4">
      <div className="flex justify-between items-center bg-card p-3.5 rounded-xl border border-border shadow-3xs">
        <h3 className="text-sm font-bold text-foreground tracking-tight uppercase flex items-center gap-1.5 font-sans">
          <Building2 className="w-4 h-4 text-emerald-600" />
          {t.property_list}
        </h3>
        {canModify && (
          <button
            onClick={onAddClick}
            className="p-1 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
            id="open-add-property-modal"
          >
            <Plus className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Add' : 'បន្ថែម'}
          </button>
        )}
      </div>

      <div className="space-y-3" id="properties-vertical-stack">
        {properties.map((prop) => {
          const isSelected = prop.id === selectedPropId;
          const propRooms = rooms.filter((r) => r.propertyId === prop.id);
          const occCount = propRooms.filter((r) => r.status === 'occupied').length;

          return (
            <div
              key={prop.id}
              onClick={() => onSelect(prop.id)}
              className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                  : 'bg-card border-border hover:border-border'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded-md text-muted-foreground font-sans">
                  {prop.type === 'borey'
                    ? lang === 'en'
                      ? 'Borey/Villa'
                      : 'បុរី/វីឡា'
                    : prop.type === 'condo'
                      ? 'CONDO'
                      : prop.type === 'guesthouse'
                        ? lang === 'en'
                          ? 'Guesthouse'
                          : 'ផ្ទះសំណាក់'
                        : lang === 'en'
                          ? 'Apartment'
                          : 'អាផាតមិន'}
                </span>
                {canModify && isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProp(prop.id, prop.name, prop.nameKh);
                    }}
                    className="text-muted-foreground hover:text-rose-600 transition p-1 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title={lang === 'en' ? 'Delete Property Location' : 'លុបទីតាំង'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h4 className="font-bold text-foreground text-sm mt-2 transition group-hover:text-emerald-700 font-sans">
                {lang === 'en' ? prop.name : prop.nameKh}
              </h4>

              <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="line-clamp-2">{lang === 'en' ? prop.address : prop.addressKh}</span>
              </p>

              <div className="mt-4 pt-3 border-t border-dashed border-border flex justify-between items-center text-xs text-muted-foreground font-sans">
                <span>
                  {propRooms.length} {t.room_count}
                </span>
                <span className="font-semibold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">
                  {occCount} {lang === 'en' ? 'Occupied' : 'ជួលរួច'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
