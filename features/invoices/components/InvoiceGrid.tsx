import { useTranslations } from 'next-intl';
import { Coins, Printer, CheckCircle2, Lightbulb, Droplet, ClipboardList, Send } from 'lucide-react';
import { Invoice, Room, Tenant, Property, AppLanguage } from '@/lib/types';
import { formatUSD, formatKHR } from '@/lib/format';
import {
  MonthOption,
  getRoomNameByInvoice,
  getTenantNameByInvoice,
} from '../invoices.helpers';

export function InvoiceGrid({
  invoices,
  rooms,
  properties,
  tenants,
  activeMonths,
  canPay,
  onPrint,
  onDispatch,
  onPay,
  lang,
}: {
  invoices: Invoice[];
  rooms: Room[];
  properties: Property[];
  tenants: Tenant[];
  activeMonths: MonthOption[];
  canPay: boolean;
  onPrint: (inv: Invoice) => void;
  onDispatch: (inv: Invoice) => void;
  onPay: (inv: Invoice) => void;
  lang: AppLanguage;
}) {
  const t = useTranslations('Invoices');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="invoices-registry-grid-list">
      {invoices.length === 0 ? (
        <div className="md:col-span-2 lg:col-span-3 bg-card border border-border p-16 rounded-xl text-center shadow-3xs">
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
          <p className="text-sm text-muted-foreground mt-2.5 font-sans italic">
            {t('no_invoices_match_filters')}
          </p>
        </div>
      ) : (
        invoices.map((inv) => {
          const rName = getRoomNameByInvoice(inv, rooms, properties, lang);
          const tenantName = getTenantNameByInvoice(inv, tenants, lang);
          const cycleMonth = activeMonths.find((m) => m.value === inv.month)?.label || inv.month;
          const elecUnits = inv.electricityCurr - inv.electricityPrev;
          const waterUnits = inv.waterCurr - inv.waterPrev;

          let badgeStyle = 'bg-destructive/10 border-destructive/20 text-destructive';
          let label = t('unpaid');
          if (inv.status === 'paid') {
            badgeStyle = 'bg-chart-2/10 border-chart-2/20 text-chart-2';
            label = t('paid');
          } else if (inv.status === 'partial') {
            badgeStyle = 'bg-chart-1/10 border-chart-1/20 text-chart-1';
            label = t('partial');
          } else if (inv.status === 'overdue') {
            badgeStyle = 'bg-destructive/20 border-destructive/30 text-destructive animate-pulse';
            label = t('overdue');
          }

          return (
            <div
              key={inv.id}
              className="bg-card border border-border rounded-xl p-5 shadow-3xs hover:border-border transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 border-b border-border pb-3">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground font-bold block">{inv.invoiceNumber}</span>
                    <h4 className="font-sans font-bold text-foreground text-base mt-0.5 flex items-center gap-1">
                      {rName}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide ${badgeStyle}`}>
                    {label}
                  </span>
                </div>

                <div className="py-4 space-y-2 border-b border-dashed border-border text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tenant_name')}</span>
                    <span className="font-semibold text-foreground">{tenantName}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-muted-foreground font-sans">{t('billing_cycle')}</span>
                    <span className="text-foreground font-bold">
                      {cycleMonth} {inv.year}
                    </span>
                  </div>

                  <div className="p-2.5 bg-muted rounded-lg flex flex-col gap-1 text-[11px] text-muted-foreground font-sans mt-2">
                    <div className="flex justify-between">
                      <span>{t('base_rent_amount')}</span>
                      <span className="font-mono font-bold text-foreground">${inv.rentAmountUSD}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-0.5 text-chart-1 font-semibold">
                        <Lightbulb className="w-3.5 h-3.5" />
                        {t('electric_cost')} ({elecUnits} kWh)
                      </span>
                      <span className="font-mono text-foreground">${inv.electricityCostUSD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-0.5 text-info font-semibold">
                        <Droplet className="w-3.5 h-3.5" />
                        {t('water_cost')} ({waterUnits} m³)
                      </span>
                      <span className="font-mono text-foreground">${inv.waterCostUSD.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-bold text-foreground">{t('total_amount')}</span>
                    <div className="text-right">
                      <span className="font-bold text-base text-chart-2 font-mono block">
                        {formatUSD(inv.totalAmountUSD)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        ≈ {formatKHR(inv.totalAmountKHR)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-2 border-t border-dashed border-border flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground font-sans">{t('telegram_delivery')}</span>
                {inv.telegramStatus === 'sent' ? (
                  <span className="text-chart-2 font-mono font-bold flex items-center gap-1 bg-chart-2/10 border border-chart-2/20 px-1.5 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-2"></span>
                    Sent ({inv.telegramSentDate})
                  </span>
                ) : inv.telegramStatus === 'failed' ? (
                  <span
                    className="text-destructive font-mono font-bold bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 rounded flex items-center gap-1"
                    title={inv.telegramError}
                  >
                    ⚠️ Failed ({inv.telegramError?.slice(0, 12)}...)
                  </span>
                ) : inv.telegramStatus === 'scheduled' ? (
                  <span className="text-info font-bold bg-info/10 border border-info/20 px-1.5 py-0.5 rounded">
                    Scheduled ({inv.telegramScheduledDate})
                  </span>
                ) : (
                  <span className="text-muted-foreground italic bg-muted border border-border px-1.5 py-0.5 rounded">Unscheduled</span>
                )}
              </div>

              <div className="pt-4 flex gap-2 w-full">
                <button
                  onClick={() => onPrint(inv)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-muted hover:bg-muted border border-border text-foreground transition flex items-center justify-center gap-1 cursor-pointer"
                  title={t('print_invoice')}
                >
                  <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                  {t('receipt')}
                </button>

                <button
                  onClick={() => onDispatch(inv)}
                  className="py-1.5 px-3 rounded-lg bg-info/10 hover:bg-info/20 border border-info/30 text-info font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title={t('send_telegram')}
                >
                  <Send className="w-3.5 h-3.5 text-info" />
                </button>

                {inv.status !== 'paid' && canPay ? (
                  <button
                    onClick={() => onPay(inv)}
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-chart-2 hover:bg-chart-2/90 text-white transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    {t('pay')}
                  </button>
                ) : inv.status !== 'paid' ? (
                  <button
                    disabled
                    className="flex-1 py-1.5 text-xs text-center border border-dashed border-border text-muted-foreground rounded-lg cursor-not-allowed animate-pulse"
                  >
                    {t('unpaid')}
                  </button>
                ) : (
                  <div className="flex-1 py-1.5 text-xs bg-chart-2/10 text-chart-2 font-bold border border-chart-2/20 rounded-lg flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-chart-2" />
                    {t('cleared')}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
