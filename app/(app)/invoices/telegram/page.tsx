'use client';

import TelegramDeliveryView from '@/features/invoices/TelegramDeliveryView';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useProperties, useRooms } from '@/features/properties/properties.queries';
import { useTenants } from '@/features/tenants/tenants.queries';
import { useInvoices, useInvoiceMutations } from '@/features/invoices/invoices.queries';
import { useLogAction } from '@/features/activity/activity.queries';

export default function TelegramDeliveryPage() {
  const { lang } = useRent();
  const { data: invoices = [], isLoading: lInvoices } = useInvoices();
  const { data: rooms = [], isLoading: lRooms } = useRooms();
  const { data: tenants = [], isLoading: lTenants } = useTenants();
  const { data: properties = [], isLoading: lProperties } = useProperties();
  const { recordPayment, generate } = useInvoiceMutations();
  const logAction = useLogAction();

  if (lInvoices || lRooms || lTenants || lProperties) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <TelegramDeliveryView
        invoices={invoices}
        rooms={rooms}
        tenants={tenants}
        properties={properties}
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
