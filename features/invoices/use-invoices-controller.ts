'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Invoice, Room, Tenant, Property, AppLanguage } from '@/lib/types';
import { getRoomNameByInvoice, generateTelegramInvoiceHTML } from './invoices.helpers';

type PayMethod = 'cash' | 'aba' | 'wing' | 'other';
type TestStatus = 'success' | 'failed' | 'loading' | '';

async function dispatchToTelegram(tenantId: string, text: string) {
  const res = await fetch('/api/telegram/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, text }),
  });
  return { ok: res.ok, data: await res.json() };
}

interface Args {
  invoices: Invoice[];
  rooms: Room[];
  tenants: Tenant[];
  properties: Property[];
  canGenerate: boolean;
  canPay: boolean;
  lang: AppLanguage;
  onAutoGenerateInvoices: (year: number, month: number) => void;
  onRecordPayment: (
    invoiceId: string,
    amount: number,
    method: PayMethod,
    notes?: string
  ) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
  onUpdateInvoices?: (updatedInvoices: Invoice[]) => void;
}

/** Owns filtering, payment, telegram-dispatch and print state for the invoices feature. */
export function useInvoicesController({
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
}: Args) {
  const t = useTranslations('Invoices');
  const tCommon = useTranslations('Common');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTelegramStatus, setSelectedTelegramStatus] = useState<string>('all');

  const availableYears = useMemo(
    () => Array.from(new Set(invoices.map((inv) => inv.year))).sort((a, b) => b - a),
    [invoices]
  );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Period picker for the generate action. Defaults to the current real month
  // so the common case ("bill this month") is a single click.
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genYear, setGenYear] = useState<number>(currentYear);
  const [genMonth, setGenMonth] = useState<number>(currentMonth);

  // Year options for the picker: every year that already has invoices, plus a
  // window around the current year so past periods (back-billing) and future
  // periods stay reachable.
  const generateYears = useMemo(() => {
    const YEAR_WINDOW = 5; // years selectable on either side of the current year
    const years = new Set<number>(invoices.map((inv) => inv.year));
    for (let y = currentYear - YEAR_WINDOW; y <= currentYear + YEAR_WINDOW; y++) {
      years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [invoices, currentYear]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [targetInvoiceId, setTargetInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PayMethod>('aba');
  const [payNotes, setPayNotes] = useState('');

  const [telegramScheduledDate, setTelegramScheduledDate] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
    if (typeof window !== 'undefined') {
      return localStorage.getItem('khrent_telegram_scheduled_date') || today;
    }
    return today;
  });
  const [telegramIsSettingsOpen, setTelegramIsSettingsOpen] = useState(false);
  const [telegramIsDispatching, setTelegramIsDispatching] = useState(false);
  const [telegramLogs, setTelegramLogs] = useState<string[]>([]);
  const [telegramProgress, setTelegramProgress] = useState(0);
  const [telegramTestStatus, setTelegramTestStatus] = useState<TestStatus>('');

  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  const sortedInvoices = useMemo(
    () =>
      [...invoices].sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        if (b.month !== a.month) return b.month - a.month;
        return b.invoiceNumber.localeCompare(a.invoiceNumber);
      }),
    [invoices]
  );

  const filteredInvoices = useMemo(
    () =>
      sortedInvoices.filter((inv) => {
        const statusMatch = selectedStatus === 'all' || inv.status === selectedStatus;
        const monthMatch = selectedMonth === 'all' || inv.month === Number(selectedMonth);
        const yearMatch = selectedYear === 'all' || inv.year === Number(selectedYear);
        const telegramMatch =
          selectedTelegramStatus === 'all' ||
          (inv.telegramStatus || 'unscheduled') === selectedTelegramStatus;
        if (!statusMatch || !monthMatch || !yearMatch || !telegramMatch) return false;
        if (selectedProperty === 'all') return true;
        const room = rooms.find((r) => r.id === inv.roomId);
        return room?.propertyId === selectedProperty;
      }),
    [sortedInvoices, rooms, selectedStatus, selectedMonth, selectedYear, selectedTelegramStatus, selectedProperty]
  );

  const roomName = (inv: Invoice) => getRoomNameByInvoice(inv, rooms, properties, lang);

  function handleSaveScheduledDate(date: string) {
    setTelegramScheduledDate(date);
    if (typeof window !== 'undefined')
      localStorage.setItem('khrent_telegram_scheduled_date', date);
    if (onUpdateInvoices) {
      const updated = invoices.map((inv) =>
        inv.status !== 'paid' && (!inv.telegramStatus || inv.telegramStatus === 'unscheduled')
          ? { ...inv, telegramScheduledDate: date, telegramStatus: 'scheduled' as const }
          : inv
      );
      onUpdateInvoices(updated);
    }
  }

  async function handleTestBotConnection() {
    setTelegramTestStatus('loading');
    try {
      const res = await fetch('/api/telegram/status');
      const body = await res.json();
      setTelegramTestStatus(res.ok && body.connected ? 'success' : 'failed');
    } catch {
      setTelegramTestStatus('failed');
    }
  }

  async function handleDispatchSingleInvoice(invoice: Invoice) {
    const tenant = tenants.find((tIdx) => tIdx.id === invoice.tenantId);
    if (!tenant || !tenant.telegramChatId) {
      toast.error(t('telegram_missing_chat_id'));
      return;
    }

    setTelegramIsDispatching(true);
    setTelegramLogs([`${t('dispatching')} Invoice ${invoice.invoiceNumber}...`]);

    const rName = roomName(invoice);
    const textHTML = generateTelegramInvoiceHTML(invoice, tenant.name, rName, lang);

    try {
      const { ok: resOk, data } = await dispatchToTelegram(tenant.id, textHTML);
      if (resOk && data.success) {
        const updated = invoices.map((i) =>
          i.id === invoice.id
            ? {
                ...i,
                telegramStatus: 'sent' as const,
                telegramSentDate: new Date().toISOString().split('T')[0],
                telegramScheduledDate,
                telegramError: undefined,
              }
            : i
        );
        onUpdateInvoices?.(updated);
        setTelegramLogs((prev) => [...prev, `✅ SUCCESS: Dispatched packet ID ${data.messageId || 'N/A'}`]);
        logAction(
          'Sent Telegram Invoice',
          'បានបញ្ជូនវិក្កយបត្រតេឡេក្រាម',
          `Successfully dispatched invoice notification ${invoice.invoiceNumber} to ${tenant.name} on Telegram`,
          `បានបញ្ជូនវិក្កយបត្របន្ទប់ ${rName} ទៅកាន់ ${tenant.nameKh} តាមតេឡេក្រាមជោគជ័យ`
        );
      } else {
        const errMsg = data.error || 'Server proxy failed';
        setTelegramLogs((prev) => [...prev, `❌ FAILED: ${errMsg}`]);
        const updated = invoices.map((i) =>
          i.id === invoice.id ? { ...i, telegramStatus: 'failed' as const, telegramError: errMsg } : i
        );
        onUpdateInvoices?.(updated);
      }
    } catch (err: any) {
      setTelegramLogs((prev) => [...prev, `❌ EXCEPTION: ${err.message || 'Network error'}`]);
    } finally {
      setTelegramIsDispatching(false);
    }
  }

  async function handleTriggerScheduledQueue() {
    const dispatchable = filteredInvoices.filter((inv) => {
      if (inv.status === 'paid') return false;
      const tenant = tenants.find((tn) => tn.id === inv.tenantId);
      return !!(tenant && tenant.telegramChatId);
    });

    if (dispatchable.length === 0) {
      toast.error(t('no_dispatchable_invoices'));
      return;
    }

    setTelegramIsDispatching(true);
    setTelegramProgress(0);
    setTelegramLogs([`🚀 Starting scheduled auto-send cycle for ${dispatchable.length} invoices...`]);

    let successCount = 0;
    let failedCount = 0;
    let localInvoices = [...invoices];

    for (let index = 0; index < dispatchable.length; index++) {
      const invoice = dispatchable[index];
      const tenant = tenants.find((tn) => tn.id === invoice.tenantId)!;
      const rName = roomName(invoice);

      setTelegramLogs((prev) => [
        ...prev,
        `⏳ Dispatching ${index + 1}/${dispatchable.length}: Room ${rName} (${tenant.name})...`,
      ]);
      setTelegramProgress(Math.round((index / dispatchable.length) * 100));

      const textHTML = generateTelegramInvoiceHTML(invoice, tenant.name, rName, lang);

      try {
        const { ok: resOk, data } = await dispatchToTelegram(tenant.id, textHTML);
        if (resOk && data.success) {
          localInvoices = localInvoices.map((i) =>
            i.id === invoice.id
              ? {
                  ...i,
                  telegramStatus: 'sent' as const,
                  telegramSentDate: new Date().toISOString().split('T')[0],
                  telegramScheduledDate,
                  telegramError: undefined,
                }
              : i
          );
          successCount++;
          setTelegramLogs((prev) => [...prev, `   ✅ Dispatched message ID: ${data.messageId || 'N/A'}`]);
        } else {
          const errMsg = data.error || 'Server proxy failed';
          localInvoices = localInvoices.map((i) =>
            i.id === invoice.id ? { ...i, telegramStatus: 'failed' as const, telegramError: errMsg } : i
          );
          failedCount++;
          setTelegramLogs((prev) => [...prev, `   ❌ Failed: ${errMsg}`]);
        }
      } catch (err: any) {
        localInvoices = localInvoices.map((i) =>
          i.id === invoice.id
            ? { ...i, telegramStatus: 'failed' as const, telegramError: err.message || 'Network connection failed' }
            : i
        );
        failedCount++;
        setTelegramLogs((prev) => [...prev, `   ❌ Error: ${err.message || 'Connection error'}`]);
      }
    }

    onUpdateInvoices?.(localInvoices);
    setTelegramProgress(100);
    setTelegramLogs((prev) => [
      ...prev,
      `🎉 Auto-send cycle completed! Successfully sent: ${successCount}, Failed/Skipped: ${failedCount}.`,
    ]);
    logAction(
      'Telegram Scheduled Run',
      'ស្កេននិងបញ្ជូនតេឡេក្រាមប្រចាំខែ',
      `Executed automatic bulk scheduled invoice send to Telegram. Dispatched ${successCount} items successfully.`,
      `បានដំនើរការបញ្ជូនវិក្កយបត្រស្វ័យប្រវត្តិតាមតេឡេក្រាមសរុប។ បញ្ជូនបានជោគជ័យចំនួន ${successCount} ច្បាប់។`
    );
    setTelegramIsDispatching(false);
  }

  function handleOpenPaymentClick(inv: Invoice) {
    if (!canPay) {
      toast.error(t('payment_action_denied'));
      return;
    }
    const remaining = inv.totalAmountUSD - inv.amountPaidUSD;
    setTargetInvoiceId(inv.id);
    setPayAmount(Number(remaining.toFixed(2)));
    setPayMethod('aba');
    setPayNotes('');
    setShowPaymentModal(true);
  }

  function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!canPay) return;
    if (!payAmount || payAmount <= 0) {
      toast.error(t('invalid_payment_amount'));
      return;
    }
    const currentInv = invoices.find((inv) => inv.id === targetInvoiceId);
    if (!currentInv) return;

    const remaining = currentInv.totalAmountUSD - currentInv.amountPaidUSD;
    if (payAmount > Number((remaining + 0.01).toFixed(2))) {
      toast.error(t('payment_exceeds_balance', { amount: remaining.toFixed(2) }));
      return;
    }

    onRecordPayment(targetInvoiceId, Number(payAmount), payMethod, payNotes);
    const rName = roomName(currentInv);
    logAction(
      'Recorded Rent Payment',
      'បានកត់ត្រាការទូទាត់វិក្កយបត្រ',
      `Logged payment of $${payAmount} via ${payMethod.toUpperCase()} for Room ${rName}`,
      `បានកត់ត្រាការបង់ប្រាក់ចំនួន $${payAmount} តាមរយៈ ${payMethod.toUpperCase()} សម្រាប់បន្ទប់ ${rName}`
    );
    setShowPaymentModal(false);
  }

  function handleGenerateClick() {
    if (!canGenerate) {
      toast.error(tCommon('insufficient_permissions'));
      return;
    }
    // Reset the picker to the current period each time it's opened.
    setGenYear(currentYear);
    setGenMonth(currentMonth);
    setShowGenerateModal(true);
  }

  function handleSubmitGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!canGenerate) return;
    onAutoGenerateInvoices(genYear, genMonth);
    setShowGenerateModal(false);
  }

  return {
    canGenerate,
    canPay,
    // filters
    selectedStatus,
    setSelectedStatus,
    selectedMonth,
    setSelectedMonth,
    selectedProperty,
    setSelectedProperty,
    selectedYear,
    setSelectedYear,
    availableYears,
    selectedTelegramStatus,
    setSelectedTelegramStatus,
    filteredInvoices,
    handleGenerateClick,
    // generate period picker
    showGenerateModal,
    closeGenerateModal: () => setShowGenerateModal(false),
    genYear,
    setGenYear,
    genMonth,
    setGenMonth,
    generateYears,
    handleSubmitGenerate,
    // payment
    showPaymentModal,
    closePaymentModal: () => setShowPaymentModal(false),
    payAmount,
    setPayAmount,
    payMethod,
    setPayMethod,
    payNotes,
    setPayNotes,
    handleOpenPaymentClick,
    handleSubmitPayment,
    // print
    printInvoice,
    setPrintInvoice,
    // telegram
    telegramScheduledDate,
    telegramIsSettingsOpen,
    setTelegramIsSettingsOpen,
    telegramIsDispatching,
    telegramLogs,
    setTelegramLogs,
    telegramProgress,
    telegramTestStatus,
    handleSaveScheduledDate,
    handleTestBotConnection,
    handleDispatchSingleInvoice,
    handleTriggerScheduledQueue,
  };
}
