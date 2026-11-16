'use client';

import InvoicesPayments from '@/features/invoices';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useTenants, useContracts } from '@/features/tenants/tenants.queries';
import { useReadings } from '@/features/meter-readings/readings.queries';
import { useInvoices, useInvoiceMutations } from '@/features/invoices/invoices.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function InvoicesPage() {
  const { activeRole, lang } = useRent();
  const { data: invoices = [], isLoading: lInvoices } = useInvoices();
  const { data: contracts = [], isLoading: lContracts } = useContracts();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const { data: tenants = [], isLoading: lTenants } = useTenants();
  const { data: properties = [], isLoading: lProperties } = useProperties();
  const { data: readings = [], isLoading: lReadings } = useReadings();
  const { recordPayment, generate } = useInvoiceMutations();
  const logAction = useLogAction();

  const isLoading = lInvoices || lContracts || lRooms || lTenants || lProperties || lReadings;

  if (isLoading) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <InvoicesPayments
        invoices={invoices}
        contracts={contracts}
        rooms={rooms}
        tenants={tenants}
        properties={properties}
        readings={readings}
        activeRole={activeRole}
        lang={lang}
        onAutoGenerateInvoices={(year, month) => generate.mutate({ year, month })}
        onRecordPayment={(invoiceId, amount, method, notes, paidDate) =>
          recordPayment.mutateAsync({ invoiceId, amount, method, notes, paidDate })
        }
        logAction={logAction}
      />
    </PageTransition>
  );
}
