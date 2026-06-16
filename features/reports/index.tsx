'use client';

import { useMemo, useState } from 'react';
import { Invoice, Room, Property, Contract, AppLanguage } from '@/lib/types';
import { getReportData } from './reports.helpers';
import { ReportFilters } from './components/ReportFilters';
import { SummaryCards } from './components/SummaryCards';
import { MonthlyTable } from './components/MonthlyTable';
import { RoomRevenueTable } from './components/RoomRevenueTable';

interface FinancialReportsProps {
  invoices: Invoice[];
  rooms: Room[];
  properties: Property[];
  contracts: Contract[];
  lang: AppLanguage;
  t: any;
}

export default function FinancialReports({
  invoices,
  rooms,
  properties,
  lang,
  t,
}: FinancialReportsProps) {
  const [selectedYear] = useState<number>(2026);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  const reportData = useMemo(
    () => getReportData(invoices, rooms, properties, selectedYear, selectedProperty, lang),
    [invoices, rooms, properties, selectedYear, selectedProperty, lang]
  );

  return (
    <div className="space-y-6" id="financial-reports-content">
      <ReportFilters
        properties={properties}
        selectedProperty={selectedProperty}
        onSelectProperty={setSelectedProperty}
        t={t}
        lang={lang}
      />
      <SummaryCards data={reportData} lang={lang} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <MonthlyTable rows={reportData.monthlySummary} lang={lang} />
        <RoomRevenueTable rows={reportData.roomDetails} t={t} lang={lang} />
      </div>
    </div>
  );
}
