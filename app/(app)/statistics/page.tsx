'use client';

import { useRouter } from 'next/navigation';
import Statistics from '@/features/dashboard/Statistics';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useContracts } from '@/features/tenants/tenants.queries';
import { useInvoices } from '@/features/invoices/invoices.queries';
import { useLogs } from '@/features/activity/activity.queries';

export default function StatisticsPage() {
  const router = useRouter();
  const { lang } = useRent();

  const { data: properties = [], isLoading: lProperties } = useProperties();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const { data: contracts = [], isLoading: lContracts } = useContracts();
  const { data: invoices = [], isLoading: lInvoices } = useInvoices();
  const { data: logs = [], isLoading: lLogs } = useLogs();

  const isLoading = lProperties || lRooms || lContracts || lInvoices || lLogs;

  if (isLoading) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Statistics
        properties={properties}
        rooms={rooms}
        contracts={contracts}
        invoices={invoices}
        logs={logs}
        lang={lang}
        onNavigate={(tab) => router.push(`/${tab}`)}
      />
    </PageTransition>
  );
}
