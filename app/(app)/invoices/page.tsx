'use client';

import InvoicesPayments from '@/features/invoices';
import { PageTransition } from '@/components/layout/PageTransition';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useTenants, useContracts } from '@/features/tenants/tenants.queries';
import { useReadings } from '@/features/meter-readings/readings.queries';
import {
  useInvoices,
  useInvoiceMutations,
  useUpdateInvoices,
} from '@/features/invoices/invoices.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function InvoicesPage() {
  const { activeRole, lang } = useRent();
  const { data: invoices = [] } = useInvoices();
  const { data: contracts = [] } = useContracts();
  const { data: rooms = [] } = useRooms();
  const { data: tenants = [] } = useTenants();
  const { data: properties = [] } = useProperties();
  const { data: readings = [] } = useReadings();
  const { recordPayment, generate } = useInvoiceMutations();
  const updateInvoices = useUpdateInvoices();
  const logAction = useLogAction();

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
        onAutoGenerateInvoices={() => generate.mutate({ year: 2026, month: 6 })}
        onRecordPayment={(invoiceId, amount, method, notes) =>
          recordPayment.mutate({ invoiceId, amount, method, notes })
        }
        logAction={logAction}
        onUpdateInvoices={updateInvoices}
      />
    </PageTransition>
  );
}
