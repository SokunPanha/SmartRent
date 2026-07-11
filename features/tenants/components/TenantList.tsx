import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, UserPlus, Trash2, Phone, UserSquare, AlertCircle, Send, Copy, Check, MessageCircle } from 'lucide-react';
import { Tenant, AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { TelegramConnectCode } from '../tenants.api';
import { useTenantMessages, useSendTenantMessage } from '../tenants.queries';

export function TenantList({
  tenants,
  canModify,
  onAdd,
  onDelete,
  onGenerateTelegramCode,
  lang,
}: {
  tenants: Tenant[];
  canModify: boolean;
  onAdd: () => void;
  onDelete: (id: string, name: string) => void;
  onGenerateTelegramCode: (tenantId: string) => Promise<TelegramConnectCode>;
  lang: AppLanguage;
}) {
  const t = useTranslations('Tenants');
  const [connectFor, setConnectFor] = useState<Tenant | null>(null);
  const [connectResult, setConnectResult] = useState<TelegramConnectCode | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [messagesFor, setMessagesFor] = useState<Tenant | null>(null);
  const [draft, setDraft] = useState('');
  const messagesQuery = useTenantMessages(messagesFor?.id ?? null);
  const sendMessage = useSendTenantMessage(messagesFor?.id ?? null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesQuery.data]);

  function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage.mutate(draft.trim(), { onSuccess: () => setDraft('') });
  }

  async function handleGenerateCode(tenant: Tenant) {
    setConnectFor(tenant);
    setConnectResult(null);
    setCopied(false);
    setConnectLoading(true);
    try {
      const result = await onGenerateTelegramCode(tenant.id);
      setConnectResult(result);
    } finally {
      setConnectLoading(false);
    }
  }

  function handleCopyLink() {
    if (!connectResult?.deepLink) return;
    navigator.clipboard.writeText(connectResult.deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="lg:col-span-5 space-y-4">
      <div className="flex justify-between items-center bg-card p-3.5 rounded-xl border border-border shadow-3xs">
        <h3 className="text-sm font-bold text-foreground tracking-tight uppercase flex items-center gap-1.5 font-sans">
          <Users className="w-4 h-4 text-primary" />
          {t('tenant_list')}
        </h3>
        {canModify && (
          <button
            onClick={onAdd}
            className="p-1 px-2.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition flex items-center gap-1 cursor-pointer"
            id="open-add-tenant-modal"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {t('register')}
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" id="tenants-stack-scroller">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            className="bg-card p-4 rounded-xl border border-border shadow-3xs flex flex-col justify-between hover:border-border transition"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <h4 className="font-bold text-foreground text-sm font-sans flex items-center gap-1">
                  {lang === 'en' ? tenant.name : tenant.nameKh}
                  {lang === 'kh' && tenant.name !== tenant.nameKh && (
                    <span className="text-xs text-muted-foreground font-normal">({tenant.name})</span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  {t('check_in')}: <span className="font-semibold text-foreground">{tenant.checkInDate}</span>
                </p>
              </div>

              {canModify && (
                <button
                  onClick={() => onDelete(tenant.id, tenant.name)}
                  className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition cursor-pointer"
                  title={t('delete_tenant')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border text-xs text-muted-foreground font-sans">
              <div className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-mono">{tenant.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <UserSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-mono text-[11px] truncate" title={tenant.nationalId}>
                  {tenant.nationalId}
                </span>
              </div>
            </div>

            <div className="mt-2 p-1.5 bg-info/10 rounded-lg border border-info/20 flex items-center justify-between font-sans text-[10px] gap-2">
              {tenant.telegramChatId ? (
                <>
                  <span className="text-info font-mono font-bold truncate">
                    ✈️ {t('connected')}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`px-1.5 py-0.2 rounded-md font-bold uppercase ${
                        tenant.telegramAutoSend
                          ? 'text-chart-2 bg-chart-2/10 border border-chart-2/20'
                          : 'text-muted-foreground bg-muted border border-border'
                      }`}
                    >
                      {tenant.telegramAutoSend ? t('auto_send') : t('manual')}
                    </span>
                    <button
                      onClick={() => setMessagesFor(tenant)}
                      title={t('messages')}
                      className="p-1 rounded-md text-info bg-info/10 border border-info/20 hover:bg-info/20 transition cursor-pointer"
                    >
                      <MessageCircle className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground truncate">
                    {t('telegram_not_connected')}
                  </span>
                  {canModify && (
                    <button
                      onClick={() => handleGenerateCode(tenant)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0 text-info bg-info/10 border border-info/20 hover:bg-info/20 transition cursor-pointer"
                    >
                      <Send className="w-2.5 h-2.5" />
                      {t('generate_code')}
                    </button>
                  )}
                </>
              )}
            </div>

            {tenant.emergencyContact && (
              <div className="mt-2.5 p-2 bg-muted rounded-lg text-[10px] text-muted-foreground border border-border flex items-start gap-1 font-sans">
                <AlertCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-1">{tenant.emergencyContact}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={!!connectFor} onClose={() => setConnectFor(null)} size="sm">
        {connectFor && (
          <div className="p-5 space-y-3">
            <h3 className="font-heading text-sm font-bold text-foreground">
              {t('connect_telegram')} — {connectFor.name}
            </h3>
            {connectLoading && (
              <p className="text-xs text-muted-foreground">{t('generating_code')}</p>
            )}
            {connectResult && (
              <div className="space-y-3">
                <div className="text-center py-3 bg-info/10 rounded-lg border border-info/20">
                  <p className="text-[10px] text-info uppercase tracking-wider font-bold">
                    {t('connect_code')}
                  </p>
                  <p className="text-2xl font-mono font-bold text-info tracking-widest mt-1">
                    {connectResult.code}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t('expires')}: {new Date(connectResult.expiresAt).toLocaleTimeString()}
                  </p>
                </div>
                {connectResult.deepLink && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-muted-foreground">
                      {t('share_link_prompt')}
                    </p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={connectResult.deepLink}
                        className="w-full px-2 py-1.5 rounded-lg border border-border text-[11px] font-mono bg-muted text-foreground"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-2.5 py-1.5 rounded-lg border border-border text-primary hover:bg-muted transition cursor-pointer shrink-0"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {t('telegram_connect_instructions')}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!messagesFor} onClose={() => setMessagesFor(null)} size="sm">
        {messagesFor && (
          <div className="p-5 flex flex-col h-[60vh]">
            <h3 className="font-heading text-sm font-bold text-foreground mb-3">
              {t('messages')} — {messagesFor.name}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pb-2">
              {messagesQuery.data?.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">{t('no_messages_yet')}</p>
              )}
              {messagesQuery.data?.map((m) => (
                <div key={m.id} className={`flex ${m.senderType === 'staff' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                      m.senderType === 'staff'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border border-border text-foreground'
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>
            <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-border">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('message_placeholder')}
                className="flex-1 px-3 py-2 rounded-lg border border-border text-xs bg-card text-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={sendMessage.isPending || !draft.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {t('send')}
              </button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
