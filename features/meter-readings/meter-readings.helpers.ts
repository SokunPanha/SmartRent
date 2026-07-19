import { MeterReading, Room, Property, AppLanguage } from '@/lib/types';
import { pickLocale } from '@/lib/i18n';

export interface MonthOption {
  value: number;
  label: string;
}

const MONTH_KEYS = [
  'month_1',
  'month_2',
  'month_3',
  'month_4',
  'month_5',
  'month_6',
  'month_7',
  'month_8',
  'month_9',
  'month_10',
  'month_11',
  'month_12',
];

export function getMonthNames(t: (key: string) => string): MonthOption[] {
  return MONTH_KEYS.map((key, i) => ({ value: i + 1, label: t(key) }));
}

export function sortReadings(readings: MeterReading[]): MeterReading[] {
  return [...readings].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    if (b.month !== a.month) return b.month - a.month;
    return b.readingDate.localeCompare(a.readingDate);
  });
}

export function filterReadings(
  readings: MeterReading[],
  rooms: Room[],
  selectedPropId: string,
  selectedMonth: string,
  selectedYear: string = 'all'
): MeterReading[] {
  return readings.filter((r) => {
    const room = rooms.find((roomItem) => roomItem.id === r.roomId);
    if (!room) return false;
    const propMatch = selectedPropId === 'all' || room.propertyId === selectedPropId;
    const monthMatch = selectedMonth === 'all' || r.month === Number(selectedMonth);
    const yearMatch = selectedYear === 'all' || r.year === Number(selectedYear);
    return propMatch && monthMatch && yearMatch;
  });
}

export function getAvailableYears(readings: MeterReading[]): number[] {
  return Array.from(new Set(readings.map((r) => r.year))).sort((a, b) => b - a);
}

export function getRoomNumber(rooms: Room[], roomId: string): string {
  return rooms.find((item) => item.id === roomId)?.roomNumber ?? 'Unknown';
}

export function getPropertyName(
  rooms: Room[],
  properties: Property[],
  roomId: string,
  lang: AppLanguage
): string {
  const room = rooms.find((item) => item.id === roomId);
  if (!room) return 'Unknown';
  const prop = properties.find((p) => p.id === room.propertyId);
  return prop ? pickLocale(lang, prop.name, prop.nameKh) : 'Unknown';
}
