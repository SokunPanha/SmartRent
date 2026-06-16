'use client';

import { ClipboardList } from 'lucide-react';
import { Invoice, Contract, Room, Tenant, Property, MeterReading, UserRole, AppLanguage } from '@/lib/types';
import { useCan } from '@/features/admin/permissions.queries';
import { getActiveMonths } from './invoices.helpers';
import { useInvoicesController } from './use-invoices-controller';
import { InvoiceFilters } from './components/InvoiceFilters';
import { TelegramHub } from './components/TelegramHub';
import { InvoiceGrid } from './components/InvoiceGrid';
import { PaymentModal } from './components/PaymentModal';
import { PrintInvoiceModal } from './components/PrintInvoiceModal';

interface InvoicesPaymentsProps {
  invoices: Invoice[];
  contracts: Contract[];
  rooms: Room[];
  tenants: Tenant[];
  properties: Property[];
  readings: MeterReading[];
  activeRole: UserRole;
  lang: AppLanguage;
  t: any;
  onAutoGenerateInvoices: () => void;
  onRecordPayment: (
    invoiceId: string,
    amount: number,
    method: 'cash' | 'aba' | 'wing' | 'other',
    notes?: string
  ) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
  onUpdateInvoices?: (updatedInvoices: Invoice[]) => void;
}

export default function InvoicesPayments({
  invoices,
  rooms,
  tenants,
  properties,
  activeRole,
  lang,
  t,
  onAutoGenerateInvoices,
  onRecordPayment,
  logAction,
  onUpdateInvoices,
}: InvoicesPaymentsProps) {
  const can = useCan();
  const canGenerate = can('invoices.generate');
  const canPay = can('invoices.pay');

  const activeMonths = getActiveMonths(lang);

  const c = useInvoicesController({
    invoices,
    rooms,
    tenants,
    properties,
    canGenerate,
    canPay,
    lang,
    t,
    onAutoGenerateInvoices,
    onRecordPayment,
    logAction,
    onUpdateInvoices,
  });

  return (
    <div className="space-y-6" id="invoices-payments-container">
      {!canPay && (
        <div className="bg-amber-50/75 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center gap-2 font-sans">
          <ClipboardList className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <span className="font-bold">
              {lang === 'en' ? 'STAFF PERSONA DETECTED - ' : 'កំណត់សម្គាល់តួនាទីបុគ្គលិក - '}
            </span>
            {lang === 'en'
              ? 'Your profile limits payments logging. You can generate auto invoices and record readings.'
              : 'អ្នកអាចបង្កើតអគ្គិសនីវិក្កយបត្របាន ប៉ុន្តែមិនមានសិទ្ធិកាត់កង់បង់ទឹកប្រាក់ឡើយ។'}
          </div>
        </div>
      )}

      <InvoiceFilters
        activeMonths={activeMonths}
        selectedStatus={c.selectedStatus}
        onSelectStatus={c.setSelectedStatus}
        selectedMonth={c.selectedMonth}
        onSelectMonth={c.setSelectedMonth}
        canGenerate={canGenerate}
        onGenerate={c.handleGenerateClick}
        t={t}
        lang={lang}
      />

      <TelegramHub c={c} tenants={tenants} lang={lang} />

      <InvoiceGrid
        invoices={c.filteredInvoices}
        rooms={rooms}
        properties={properties}
        tenants={tenants}
        activeMonths={activeMonths}
        canPay={canPay}
        onPrint={c.setPrintInvoice}
        onDispatch={c.handleDispatchSingleInvoice}
        onPay={c.handleOpenPaymentClick}
        t={t}
        lang={lang}
      />

      <PaymentModal c={c} t={t} lang={lang} />

      <PrintInvoiceModal
        invoice={c.printInvoice}
        rooms={rooms}
        tenants={tenants}
        properties={properties}
        activeMonths={activeMonths}
        onClose={() => c.setPrintInvoice(null)}
        t={t}
        lang={lang}
      />
    </div>
  );
}
