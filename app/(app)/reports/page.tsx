'use client';

import FinancialReports from '@/features/reports';
import { PageTransition } from '@/components/layout/PageTransition';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useContracts } from '@/features/tenants/tenants.queries';
import { useInvoices } from '@/features/invoices/invoices.queries';

export default function ReportsPage() {
  const { lang } = useRent();
  const { data: invoices = [] } = useInvoices();
  const { data: rooms = [] } = useRooms();
  const { data: properties = [] } = useProperties();
  const { data: contracts = [] } = useContracts();

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
