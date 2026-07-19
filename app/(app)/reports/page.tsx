'use client';

import FinancialReports from '@/features/reports';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useContracts } from '@/features/tenants/tenants.queries';
import { useInvoices } from '@/features/invoices/invoices.queries';

export default function ReportsPage() {
  const { lang } = useRent();
  const { data: invoices = [], isLoading: lInvoices } = useInvoices();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const { data: properties = [], isLoading: lProperties } = useProperties();
  const { data: contracts = [], isLoading: lContracts } = useContracts();

  const isLoading = lInvoices || lRooms || lProperties || lContracts;

  if (isLoading) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <FinancialReports
        invoices={invoices}
        rooms={rooms}
        properties={properties}
        contracts={contracts}
        lang={lang}
      />
    </PageTransition>
  );
}
