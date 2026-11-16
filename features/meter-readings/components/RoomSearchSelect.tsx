import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Room, Property, AppLanguage } from '@/lib/types';
import { getRoomNumber, getPropertyName } from '../meter-readings.helpers';

/** Type-to-filter room picker used where a plain dropdown would be too slow to
 *  scan (properties with many rooms across buildings). */
export function RoomSearchSelect({
  rooms,
  properties,
  value,
  onChange,
  lang,
  disabled = false,
}: {
  rooms: Room[];
  properties: Property[];
  value: string;
  onChange: (roomId: string) => void;
  lang: AppLanguage;
  disabled?: boolean;
}) {
  const t = useTranslations('MeterReadings');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = value
    ? `${getRoomNumber(rooms, value)} (${getPropertyName(rooms, properties, value, lang)})`
    : '';

  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => {
      const roomNumber = getRoomNumber(rooms, r.id).toLowerCase();
      const propName = getPropertyName(rooms, properties, r.id, lang).toLowerCase();
      return roomNumber.includes(q) || propName.includes(q);
    });
  }, [rooms, properties, query, lang]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(roomId: string) {
    onChange(roomId);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-full border border-(--card-border) bg-card text-sm font-sans font-semibold text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        id="reading-room-select-trigger"
      >
        <span className={selectedLabel ? 'text-foreground' : 'text-muted-foreground font-normal'}>
          {selectedLabel || t('select_room_placeholder')}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-(--card-border) bg-card shadow-modal overflow-hidden">
          <div className="relative border-b border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('room_search_placeholder')}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-transparent text-foreground font-sans focus:outline-none"
              id="reading-room-search-input"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredRooms.length === 0 ? (
              <p className="p-3 text-xs text-muted-foreground text-center font-sans">
                {t('no_rooms_match_search')}
              </p>
            ) : (
              filteredRooms.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelect(r.id)}
                  className="w-full text-left px-3.5 py-2.5 rounded-full text-xs font-sans hover:bg-muted transition data-[selected=true]:bg-primary/10"
                  data-selected={r.id === value}
                >
                  <span className="font-semibold text-foreground">{getRoomNumber(rooms, r.id)}</span>{' '}
                  <span className="text-muted-foreground">
                    ({getPropertyName(rooms, properties, r.id, lang)})
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
