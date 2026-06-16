import { MeterReading, Room, Property, AppLanguage } from '@/lib/types';

export interface MonthOption {
  value: number;
  label: string;
}

const MONTHS: { en: string; kh: string }[] = [
  { en: 'January', kh: 'មករា' },
  { en: 'February', kh: 'កុម្ភៈ' },
  { en: 'March', kh: 'មីនា' },
  { en: 'April', kh: 'មេសា' },
  { en: 'May', kh: 'ឧសភា' },
  { en: 'June', kh: 'មិថុនា' },
  { en: 'July', kh: 'កក្កដា' },
  { en: 'August', kh: 'សីហា' },
  { en: 'September', kh: 'កញ្ញា' },
  { en: 'October', kh: 'តុលា' },
  { en: 'November', kh: 'វិច្ឆិកា' },
  { en: 'December', kh: 'ធ្នូ' },
];

export function getMonthNames(lang: AppLanguage): MonthOption[] {
  return MONTHS.map((m, i) => ({ value: i + 1, label: lang === 'en' ? m.en : m.kh }));
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
  selectedMonth: string
): MeterReading[] {
  return readings.filter((r) => {
    const room = rooms.find((roomItem) => roomItem.id === r.roomId);
    if (!room) return false;
    const propMatch = selectedPropId === 'all' || room.propertyId === selectedPropId;
    const monthMatch = selectedMonth === 'all' || r.month === Number(selectedMonth);
    return propMatch && monthMatch;
  });
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
  return prop ? (lang === 'en' ? prop.name : prop.nameKh) : 'Unknown';
}
