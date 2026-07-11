'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Invoice } from '@/lib/types';

type TenantMessage = {
  id: string;
  tenantId: string;
  senderType: 'tenant' | 'staff';
  senderUserId: string | null;
  body: string;
  createdAt: string;
};

type TenantSummary = { id: string; name: string; nameKh: string };

type Status = 'loading' | 'no-telegram' | 'not-connected' | 'ready' | 'error';

declare global {
  interface Window {
    Telegram?: { WebApp?: { initData: string; ready(): void; expand(): void } };
  }
}

const STATUS_LABEL: Record<Invoice['status'], { en: string; kh: string; className: string }> = {
  paid: { en: 'Paid', kh: 'បានទូទាត់', className: 'text-secondary bg-secondary/10 border-secondary/20' },
  unpaid: { en: 'Unpaid', kh: 'មិនទាន់ទូទាត់', className: 'text-destructive bg-destructive/10 border-destructive/20' },
  partial: { en: 'Partial', kh: 'ទូទាត់ខ្លះ', className: 'text-primary-foreground bg-primary border-primary' },
  overdue: { en: 'Overdue', kh: 'ហួសកំណត់', className: 'text-destructive bg-destructive/10 border-destructive/20' },
};

async function callApi<T>(initData: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': initData, ...init?.headers },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || json?.error || `Request failed (${res.status})`);
  return json.data as T;
}

export default function TelegramPortalPage() {
  const [lang, setLang] = useState<'en' | 'kh'>('en');
  const [status, setStatus] = useState<Status>('loading');
  const [initData, setInitData] = useState<string | null>(null);
  const [tenant, setTenant] = useState<TenantSummary | null>(null);
  const [tab, setTab] = useState<'invoices' | 'messages'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [messages, setMessages] = useState<TenantMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  function handleTelegramScriptLoad() {
    const webApp = window.Telegram?.WebApp;
    if (!webApp?.initData) {
      setStatus('no-telegram');
      return;
    }
    webApp.ready();
    webApp.expand();
    setInitData(webApp.initData);
  }

  useEffect(() => {
    if (!initData) return;
    callApi<TenantSummary>(initData, '/api/telegram-app/me')
      .then((t) => {
        setTenant(t);
        setStatus('ready');
      })
      .catch((err) => {
        setStatus(err.message?.includes('connect') ? 'not-connected' : 'error');
      });
  }, [initData]);

  useEffect(() => {
    if (status !== 'ready' || !initData) return;
    if (tab === 'invoices') {
      callApi<Invoice[]>(initData, '/api/telegram-app/invoices').then(setInvoices).catch(() => {});
    } else {
      callApi<TenantMessage[]>(initData, '/api/telegram-app/messages').then(setMessages).catch(() => {});
    }
  }, [status, tab, initData]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!initData || !draft.trim() || sending) return;
    setSending(true);
    try {
      const sent = await callApi<TenantMessage>(initData, '/api/telegram-app/messages', {
        method: 'POST',
        body: JSON.stringify({ body: draft.trim() }),
      });
      setMessages((prev) => [...prev, sent]);
      setDraft('');
    } catch {
      // swallow — a retry via the send button is enough for this surface
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" onLoad={handleTelegramScriptLoad} />
      <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="font-heading text-base font-bold">
            {lang === 'en' ? 'My Rental Portal' : 'ច្រកចូលអ្នកជួល'}
          </h1>
          <button
            onClick={() => setLang((l) => (l === 'en' ? 'kh' : 'en'))}
            className="text-xs px-2 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            {lang === 'en' ? 'ខ្មែរ' : 'EN'}
          </button>
        </header>

        <main className="flex-1 p-4">
          {status === 'loading' && (
            <p className="text-sm text-muted-foreground text-center mt-10">
              {lang === 'en' ? 'Loading...' : 'កំពុងផ្ទុក...'}
            </p>
          )}

          {status === 'no-telegram' && (
            <p className="text-sm text-muted-foreground text-center mt-10">
              {lang === 'en'
                ? 'Open this page from the Telegram app to continue.'
                : 'សូមបើកទំព័រនេះពី Telegram ដើម្បីបន្ត។'}
            </p>
          )}

          {status === 'error' && (
            <p className="text-sm text-destructive text-center mt-10">
              {lang === 'en' ? 'Something went wrong. Please try again later.' : 'មានបញ្ហា។ សូមព្យាយាមម្ដងទៀត។'}
            </p>
          )}

          {status === 'not-connected' && (
            <div className="text-center mt-10 space-y-2 px-4">
              <p className="text-sm font-semibold text-foreground">
                {lang === 'en' ? "You're not connected yet" : 'អ្នកមិនទាន់ភ្ជាប់នៅឡើយ'}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === 'en'
                  ? 'Ask your property manager for a connect code or link, then try again.'
                  : 'សូមសុំលេខកូដតភ្ជាប់ពីអ្នកគ្រប់គ្រង រួចព្យាយាមម្ដងទៀត។'}
              </p>
            </div>
          )}

          {status === 'ready' && tenant && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                {lang === 'en' ? 'Signed in as' : 'អ្នកជា'} <span className="text-foreground font-semibold">{tenant.name}</span>
              </p>

              <div className="flex gap-2 border-b border-border">
                {(['invoices', 'messages'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition ${
                      tab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                    }`}
                  >
                    {key === 'invoices'
                      ? lang === 'en'
                        ? 'Invoices'
                        : 'វិក្កយបត្រ'
                      : lang === 'en'
                        ? 'Messages'
                        : 'សារ'}
                  </button>
                ))}
              </div>

              {tab === 'invoices' && (
                <div className="space-y-2">
                  {invoices.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      {lang === 'en' ? 'No invoices yet.' : 'មិនទាន់មានវិក្កយបត្រ។'}
                    </p>
                  )}
                  {invoices.map((inv) => (
                    <div key={inv.id} className="bg-card border border-border rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{inv.invoiceNumber}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${STATUS_LABEL[inv.status].className}`}
                        >
                          {STATUS_LABEL[inv.status][lang === 'en' ? 'en' : 'kh']}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {lang === 'en' ? 'Due' : 'ថ្ងៃកំណត់'}: {inv.dueDate}
                      </p>
                      <p className="font-mono text-lg font-bold text-foreground">${inv.totalAmountUSD.toFixed(2)}</p>
                      {inv.amountPaidUSD > 0 && inv.status !== 'paid' && (
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {lang === 'en' ? 'Paid so far' : 'បានទូទាត់'}: ${inv.amountPaidUSD.toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'messages' && (
                <div className="flex flex-col h-[60vh]">
                  <div className="flex-1 overflow-y-auto space-y-2 pb-2">
                    {messages.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        {lang === 'en' ? 'No messages yet — say hello!' : 'មិនទាន់មានសារ។'}
                      </p>
                    )}
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.senderType === 'tenant' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                            m.senderType === 'tenant'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card border border-border text-foreground'
                          }`}
                        >
                          {m.body}
                        </div>
                      </div>
                    ))}
                    <div ref={threadEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-border">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={lang === 'en' ? 'Type a message...' : 'វាយសារ...'}
                      className="flex-1 px-3 py-2 rounded-lg border border-border text-xs bg-card text-foreground focus:outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      {lang === 'en' ? 'Send' : 'ផ្ញើ'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
