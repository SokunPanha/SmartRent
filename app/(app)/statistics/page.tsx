'use client';

import { useRouter } from 'next/navigation';
import Statistics from '@/features/dashboard/Statistics';
import { PageTransition } from '@/components/layout/PageTransition';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useContracts } from '@/features/tenants/tenants.queries';
import { useInvoices } from '@/features/invoices/invoices.queries';
import { useLogs } from '@/features/activity/activity.queries';

export default function StatisticsPage() {
  const router = useRouter();
  const { lang } = useRent();

  const { data: properties = [] } = useProperties();
  const { data: rooms = [] } = useRooms();
  const { data: contracts = [] } = useContracts();
  const { data: invoices = [] } = useInvoices();
  const { data: logs = [] } = useLogs();

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
