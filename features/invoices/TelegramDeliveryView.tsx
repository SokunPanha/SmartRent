'use client';

import { Invoice, Room, Tenant, Property, AppLanguage } from '@/lib/types';
import { useCan } from '@/features/admin/permissions.queries';
import { useInvoicesController } from './use-invoices-controller';
import { TelegramHub } from './components/TelegramHub';
import { TelegramAutomationCard } from './components/TelegramAutomationCard';
import { useSettings } from '@/features/settings/settings.queries';

interface TelegramDeliveryViewProps {
  invoices: Invoice[];
  rooms: Room[];
  tenants: Tenant[];
  properties: Property[];
  lang: AppLanguage;
  onAutoGenerateInvoices: (year: number, month: number) => void;
  onRecordPayment: (
    invoiceId: string,
    amount: number,
    method: 'cash' | 'aba' | 'wing' | 'other',
    notes: string | undefined,
    paidDate: string
  ) => Promise<unknown>;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
}

/** /invoices/telegram — the Telegram delivery & scheduling hub (bot status,
 *  delivery stats, scheduled send date, bulk send sweep and its log). Moved
 *  off the invoices page so that page is just the invoice list. */
export default function TelegramDeliveryView({
  invoices,
  rooms,
  tenants,
  properties,
  lang,
  onAutoGenerateInvoices,
  onRecordPayment,
  logAction,
}: TelegramDeliveryViewProps) {
  const can = useCan();
  const { data: settings } = useSettings();

  const c = useInvoicesController({
    invoices,
    rooms,
    tenants,
    properties,
    canGenerate: can('invoices.generate'),
    canPay: can('invoices.pay'),
    lang,
    onAutoGenerateInvoices,
    onRecordPayment,
    logAction,
    });

  return (
    <div className="space-y-6" id="telegram-delivery-container">
      {settings && <TelegramAutomationCard key={settings.updatedAt} settings={settings} />}
      <TelegramHub c={c} tenants={tenants} lang={lang} />
    </div>
  );
}
