'use client';

import { useRouter } from 'next/navigation';
import Dashboard from '@/features/dashboard';
import { PageTransition } from '@/components/layout/PageTransition';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useTenants, useContracts } from '@/features/tenants/tenants.queries';
import { useReadings } from '@/features/meter-readings/readings.queries';
import { useInvoices } from '@/features/invoices/invoices.queries';
import { useLogs } from '@/features/activity/activity.queries';

export default function DashboardPage() {
  const router = useRouter();
  const { lang, t } = useRent();

  const { data: properties = [] } = useProperties();
  const { data: rooms = [] } = useRooms();
  const { data: tenants = [] } = useTenants();
  const { data: contracts = [] } = useContracts();
  const { data: readings = [] } = useReadings();
  const { data: invoices = [] } = useInvoices();
  const { data: logs = [] } = useLogs();

  return (
    <PageTransition>
      <Dashboard
        properties={properties}
        rooms={rooms}
        tenants={tenants}
        contracts={contracts}
        readings={readings}
        invoices={invoices}
        logs={logs}
        lang={lang}
        t={t}
        onNavigate={(tab) => router.push(`/${tab}`)}
      />
    </PageTransition>
  );
}
