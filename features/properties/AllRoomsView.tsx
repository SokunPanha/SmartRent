'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight, DoorOpen, Search } from 'lucide-react';
import { Property, Room, Contract, Tenant, AppLanguage } from '@/lib/types';
import { pickLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, StatusBadgeTone } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination, usePagination } from '@/components/shared/Pagination';

type RoomStatus = Room['status'];
type StatusFilter = 'all' | RoomStatus;

function statusMeta(status: RoomStatus, t: (k: string) => string): { tone: StatusBadgeTone; label: string } {
  if (status === 'occupied') return { tone: 'success', label: t('occupied') };
  if (status === 'maintenance') return { tone: 'warning', label: t('maintenance') };
  return { tone: 'info', label: t('vacant') };
}

/**
 * /rooms — every room across all buildings, for quickly finding a vacant room
 * or who lives where. Read-only: clicking a room opens its building page,
 * where rooms are added, edited and deleted.
 */
export default function AllRoomsView({
  properties,
  rooms,
  contracts,
  tenants,
  lang,
}: {
  properties: Property[];
  rooms: Room[];
  contracts: Contract[];
  tenants: Tenant[];
  lang: AppLanguage;
}) {
  const t = useTranslations('Properties');
  const router = useRouter();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [building, setBuilding] = useState<string>('all');
  const [search, setSearch] = useState('');

  const propertyById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const tenantByRoom = useMemo(() => {
    const tenantById = new Map(tenants.map((tn) => [tn.id, tn]));
    const map = new Map<string, Tenant>();
    for (const c of contracts) {
      if (c.status !== 'active') continue;
      const tn = tenantById.get(c.tenantId);
      if (tn) map.set(c.roomId, tn);
    }
    return map;
  }, [contracts, tenants]);

  // Rows narrowed by building + search; status counts are taken from these so
  // the chips always describe what the other filters left.
  const scoped = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms
      .filter((r) => building === 'all' || r.propertyId === building)
      .filter((r) => {
        if (!q) return true;
        const tn = tenantByRoom.get(r.id);
        return (
          r.roomNumber.toLowerCase().includes(q) ||
          (tn && (tn.name.toLowerCase().includes(q) || tn.nameKh.includes(search.trim())))
        );
      })
      .sort((a, b) => {
        const pa = propertyById.get(a.propertyId)?.name ?? '';
        const pb = propertyById.get(b.propertyId)?.name ?? '';
        return pa.localeCompare(pb) || a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
      });
  }, [rooms, building, search, tenantByRoom, propertyById]);

  const counts = useMemo(() => {
    const c = { all: scoped.length, vacant: 0, occupied: 0, maintenance: 0 };
    for (const r of scoped) c[r.status] += 1;
    return c;
  }, [scoped]);

  const visible = status === 'all' ? scoped : scoped.filter((r) => r.status === status);
  const { page, totalPages, pageRows, setPage, pageSize } = usePagination(visible);

  const chips: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: t('all_statuses') },
    { id: 'vacant', label: t('vacant') },
    { id: 'occupied', label: t('occupied') },
    { id: 'maintenance', label: t('maintenance') },
  ];

  const open = (r: Room) => router.push(`/properties/${r.propertyId}`);
  const buildingName = (r: Room) => {
    const p = propertyById.get(r.propertyId);
    return p ? pickLocale(lang, p.name, p.nameKh) : '—';
  };
  const tenantName = (r: Room) => {
    const tn = tenantByRoom.get(r.id);
    return tn ? pickLocale(lang, tn.name, tn.nameKh) : null;
  };

  return (
    <div className="space-y-5" id="all-rooms-container">
      {/* Toolbar */}
      <div className="@container">
        <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{t('all_rooms_heading')}</h2>
          <div className="flex w-full flex-col gap-2 @xl:flex-row @3xl:w-auto">
            <div className="relative min-w-0 flex-1 @3xl:w-64 @3xl:flex-none">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_rooms_placeholder')}
                className="h-10 w-full rounded-full border border-(--card-border) bg-card pl-10 pr-4 text-sm text-foreground shadow-card focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
                id="all-rooms-search"
              />
            </div>
            <div className="flex h-10 items-center gap-1.5 rounded-full border border-(--card-border) bg-card px-4 text-xs shadow-card">
              <span className="text-muted-foreground">{t('building_col')}:</span>
              <Select value={building} onValueChange={setBuilding}>
                <SelectTrigger className="w-fit max-w-56 gap-1 border-0 bg-transparent p-0 font-bold text-foreground shadow-none focus-visible:ring-0 data-[size=default]:h-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_buildings')}</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {pickLocale(lang, p.name, p.nameKh)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Status chips with live counts */}
      <div className="scroll-x-hint -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0" role="tablist">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={status === chip.id}
            onClick={() => setStatus(chip.id)}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition cursor-pointer',
              status === chip.id
                ? 'border-foreground bg-foreground text-background'
                : 'border-(--card-border) bg-card text-foreground shadow-card hover:border-primary/30'
            )}
          >
            {chip.label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                status === chip.id ? 'bg-background/20' : 'bg-muted text-muted-foreground'
              )}
            >
              {counts[chip.id]}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={DoorOpen} title={t('no_rooms_match')} className="p-12" />
      ) : (
        <div className="overflow-hidden rounded-(--radius-card) border border-(--card-border) bg-card shadow-card">
          {/* Desktop / tablet table */}
          <div className="scroll-x-hint hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-5 py-3 text-left font-semibold">{t('room_number')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('building_col')}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t('floor')}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t('rent_per_month')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('status_col')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('tenant_col')}</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const s = statusMeta(r.status, t);
                  const tn = tenantName(r);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => open(r)}
                      className="group cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-primary/[0.04]"
                    >
                      <td className="px-5 py-3.5 font-bold text-foreground">{r.roomNumber}</td>
                      <td className="max-w-56 truncate px-4 py-3.5 text-muted-foreground">{buildingName(r)}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">{r.floor}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums text-foreground">
                        ${r.rentAmount}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                      </td>
                      <td className="max-w-48 truncate px-4 py-3.5 text-foreground">
                        {tn ?? <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        <ChevronRight className="size-4 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-border/60 sm:hidden">
            {pageRows.map((r) => {
              const s = statusMeta(r.status, t);
              const tn = tenantName(r);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => open(r)}
                  className="flex w-full flex-col gap-1.5 p-4 text-left cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-base font-bold text-foreground">{r.roomNumber}</span>
                    <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {buildingName(r)} · {t('floor')} {r.floor}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">
                      ${r.rentAmount}
                      <span className="font-sans text-xs font-normal text-muted-foreground">/mo</span>
                    </span>
                    {tn && <span className="truncate text-xs text-foreground">{tn}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={visible.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
