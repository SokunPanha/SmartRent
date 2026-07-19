'use client';

import { useTranslations } from 'next-intl';
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
  onAutoGenerateInvoices,
  onRecordPayment,
  logAction,
  onUpdateInvoices,
}: InvoicesPaymentsProps) {
  const t = useTranslations('Invoices');
  const can = useCan();
  const canGenerate = can('invoices.generate');
  const canPay = can('invoices.pay');

  const activeMonths = getActiveMonths(t);

  const c = useInvoicesController({
    invoices,
    rooms,
    tenants,
    properties,
    canGenerate,
    canPay,
    lang,
    onAutoGenerateInvoices,
    onRecordPayment,
    logAction,
    onUpdateInvoices,
  });

  return (
    <div className="space-y-6" id="invoices-payments-container">
      {!canPay && (
        <div className="bg-chart-1/10 border border-chart-1/30 text-chart-1 rounded-xl p-3 text-xs flex items-center gap-2 font-sans">
          <ClipboardList className="w-4 h-4 text-chart-1 shrink-0" />
          <div>
            <span className="font-bold">{t('staff_persona_detected')}</span>
            {t('staff_persona_limit_msg')}
          </div>
        </div>
      )}

      <InvoiceFilters
        activeMonths={activeMonths}
        selectedStatus={c.selectedStatus}
        onSelectStatus={c.setSelectedStatus}
        selectedMonth={c.selectedMonth}
        onSelectMonth={c.setSelectedMonth}
        properties={properties}
        selectedProperty={c.selectedProperty}
        onSelectProperty={c.setSelectedProperty}
        availableYears={c.availableYears}
        selectedYear={c.selectedYear}
        onSelectYear={c.setSelectedYear}
        selectedTelegramStatus={c.selectedTelegramStatus}
        onSelectTelegramStatus={c.setSelectedTelegramStatus}
        canGenerate={canGenerate}
        onGenerate={c.handleGenerateClick}
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
        lang={lang}
      />

      <PaymentModal c={c} lang={lang} />

      <PrintInvoiceModal
        invoice={c.printInvoice}
        rooms={rooms}
        tenants={tenants}
        properties={properties}
        activeMonths={activeMonths}
        onClose={() => c.setPrintInvoice(null)}
        lang={lang}
      />
    </div>
  );
}
