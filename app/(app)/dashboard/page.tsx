'use client';

import { useRouter } from 'next/navigation';
import Dashboard from '@/features/dashboard';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useTenants, useContracts } from '@/features/tenants/tenants.queries';
import { useReadings } from '@/features/meter-readings/readings.queries';
import { useInvoices } from '@/features/invoices/invoices.queries';
import { useLogs } from '@/features/activity/activity.queries';

export default function DashboardPage() {
  const router = useRouter();
  const { lang } = useRent();

  const { data: properties = [], isLoading: lProperties } = useProperties();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const { data: tenants = [], isLoading: lTenants } = useTenants();
  const { data: contracts = [], isLoading: lContracts } = useContracts();
  const { data: readings = [], isLoading: lReadings } = useReadings();
  const { data: invoices = [], isLoading: lInvoices } = useInvoices();
  const { data: logs = [], isLoading: lLogs } = useLogs();

  const isLoading =
    lProperties || lRooms || lTenants || lContracts || lReadings || lInvoices || lLogs;

  if (isLoading) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

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
        onNavigate={(tab) => router.push(`/${tab}`)}
      />
    </PageTransition>
  );
}
