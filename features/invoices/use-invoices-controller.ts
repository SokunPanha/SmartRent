'use client';

import { useMemo, useState } from 'react';
import { Invoice, Room, Tenant, Property, AppLanguage } from '@/lib/types';
import { getRoomNameByInvoice, generateTelegramInvoiceHTML } from './invoices.helpers';

type PayMethod = 'cash' | 'aba' | 'wing' | 'other';
type TestStatus = 'success' | 'failed' | 'loading' | '';

interface Args {
  invoices: Invoice[];
  rooms: Room[];
  tenants: Tenant[];
  properties: Property[];
  canGenerate: boolean;
  canPay: boolean;
  lang: AppLanguage;
  t: any;
  onAutoGenerateInvoices: () => void;
  onRecordPayment: (
    invoiceId: string,
    amount: number,
    method: PayMethod,
    notes?: string
  ) => void;
  logAction: (action: string, actionKh: string, details: string, detailsKh: string) => void;
  onUpdateInvoices?: (updatedInvoices: Invoice[]) => void;
}

const MOCK = 'MOCK_TELEGRAM_TOKEN';

/** Owns filtering, payment, telegram-dispatch and print state for the invoices feature. */
export function useInvoicesController({
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
}: Args) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [targetInvoiceId, setTargetInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PayMethod>('aba');
  const [payNotes, setPayNotes] = useState('');

  const [telegramBotToken, setTelegramBotToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('khrent_telegram_bot_token') ||
        '7829482938:AAE_MOCK_TELEGRAM_TOKEN_DEFAULT'
      );
    }
    return '7829482938:AAE_MOCK_TELEGRAM_TOKEN_DEFAULT';
  });
  const [telegramScheduledDate, setTelegramScheduledDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('khrent_telegram_scheduled_date') || '2026-06-18';
    }
    return '2026-06-18';
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
        return statusMatch && monthMatch;
      }),
    [sortedInvoices, selectedStatus, selectedMonth]
  );

  const roomName = (inv: Invoice) => getRoomNameByInvoice(inv, rooms, properties, lang);

  function handleSaveToken(token: string) {
    setTelegramBotToken(token);
    if (typeof window !== 'undefined') localStorage.setItem('khrent_telegram_bot_token', token);
  }

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
    if (!telegramBotToken || telegramBotToken.trim() === '') {
      alert(lang === 'en' ? 'Please enter a Bot Token first.' : 'សូមបញ្ចូលលេខសម្គាល់ Bot សិន។');
      return;
    }
    setTelegramTestStatus('loading');
    if (telegramBotToken.includes(MOCK)) {
      setTimeout(() => setTelegramTestStatus('success'), 1000);
      return;
    }
    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`);
      const body = await res.json();
      setTelegramTestStatus(res.ok && body.ok ? 'success' : 'failed');
    } catch {
      setTelegramTestStatus('failed');
    }
  }

  async function handleDispatchSingleInvoice(invoice: Invoice) {
    const tenant = tenants.find((tIdx) => tIdx.id === invoice.tenantId);
    if (!tenant || !tenant.telegramChatId) {
      alert(
        lang === 'en'
          ? "Error: This tenant doesn't have a Telegram Chat ID configured. Register or update the Tenant's Chat ID first."
          : 'កំហុស៖ អតិថិជននេះមិនទាន់មានលេខសម្គាល់ Telegram ឡើយ។ '
      );
      return;
    }

    setTelegramIsDispatching(true);
    setTelegramLogs([`${lang === 'en' ? 'Dispatching' : 'កំពុងបញ្ជូន'} Invoice ${invoice.invoiceNumber}...`]);

    const isMock = telegramBotToken.includes(MOCK);
    const rName = roomName(invoice);
    const textHTML = generateTelegramInvoiceHTML(invoice, tenant.name, rName, lang);

    if (isMock) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
      setTelegramLogs((prev) => [
        ...prev,
        `✅ MOCK DISPATCH SUCCESS: Message sent to chat ${tenant.telegramChatId}`,
      ]);
      setTelegramIsDispatching(false);
      logAction(
        'Telegram Dispatch (Simulation)',
        'បញ្ជូនវិក្កយបត្រតាមតេឡេក្រាម (សម្តែង)',
        `Dispatched simulated invoice notification ${invoice.invoiceNumber} to ${tenant.name}`,
        `បានបញ្ជូនវិក្កយបត្រសម្តែង ${invoice.invoiceNumber} ទៅកាន់ ${tenant.nameKh} ជោគជ័យ`
      );
      return;
    }

    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: telegramBotToken, chatId: tenant.telegramChatId, text: textHTML }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
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
      alert(
        lang === 'en'
          ? 'No dispatchable invoices found. Ensure tenants have a configured Telegram Chat ID and that invoices are unpaid.'
          : 'មិនមានវិក្កយបត្រដែលអាចបញ្ជូនបានឡើយ។ សូមពិនិត្យថាតើអតិថិជនមាន លេខសម្គាល់ Telegram និងវិក្កយបត្រពុំទាន់ទូទាត់ប្រាក់។'
      );
      return;
    }

    setTelegramIsDispatching(true);
    setTelegramProgress(0);
    setTelegramLogs([`🚀 Starting scheduled auto-send cycle for ${dispatchable.length} invoices...`]);

    const isMock = telegramBotToken.includes(MOCK);
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

      if (isMock) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
        setTelegramLogs((prev) => [...prev, `   ✅ Simulated sent successfully to Chat ID ${tenant.telegramChatId}`]);
      } else {
        try {
          const res = await fetch('/api/telegram/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: telegramBotToken, chatId: tenant.telegramChatId, text: textHTML }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
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
      alert(
        lang === 'en'
          ? 'Action Denied: Your staff persona lacks credit logging permission.'
          : 'ប្រតិបត្តិការត្រូវបានរារាំង៖ បុគ្គលិកកត់កុងទ័រមិនមានសិទ្ធិកត់ត្រាការទូទាត់ប្រាក់ឡើយ។'
      );
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
      alert(lang === 'en' ? 'Please enter a valid payment sum.' : 'សូមបញ្ចូលចំនួនទឹកប្រាក់ត្រឹមត្រូវ។');
      return;
    }
    const currentInv = invoices.find((inv) => inv.id === targetInvoiceId);
    if (!currentInv) return;

    const remaining = currentInv.totalAmountUSD - currentInv.amountPaidUSD;
    if (payAmount > Number((remaining + 0.01).toFixed(2))) {
      alert(
        lang === 'en'
          ? `Error: Payment amount cannot exceed the remaining balance ($${remaining.toFixed(2)}).`
          : `កំហុស៖ ចំនួនទឹកប្រាក់ទូទាត់ មិនអាចលើសពីចំនួននៅខ្វះឡើយ ($${remaining.toFixed(2)})។`
      );
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
      alert(t.insufficient_permissions);
      return;
    }
    onAutoGenerateInvoices();
  }

  return {
    canGenerate,
    canPay,
    // filters
    selectedStatus,
    setSelectedStatus,
    selectedMonth,
    setSelectedMonth,
    filteredInvoices,
    handleGenerateClick,
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
    telegramBotToken,
    telegramScheduledDate,
    telegramIsSettingsOpen,
    setTelegramIsSettingsOpen,
    telegramIsDispatching,
    telegramLogs,
    setTelegramLogs,
    telegramProgress,
    telegramTestStatus,
    handleSaveToken,
    handleSaveScheduledDate,
    handleTestBotConnection,
    handleDispatchSingleInvoice,
    handleTriggerScheduledQueue,
  };
}
