import { useEffect } from 'react';
import { Printer, X, QrCode } from 'lucide-react';
import { Invoice, Room, Tenant, Property, AppLanguage } from '@/lib/types';
import { formatUSD, formatKHR } from '@/lib/format';
import {
  MonthOption,
  getRoomNameByInvoice,
  getTenantNameByInvoice,
} from '../invoices.helpers';

export function PrintInvoiceModal({
  invoice,
  rooms,
  tenants,
  properties,
  activeMonths,
  onClose,
  t,
  lang,
}: {
  invoice: Invoice | null;
  rooms: Room[];
  tenants: Tenant[];
  properties: Property[];
  activeMonths: MonthOption[];
  onClose: () => void;
  t: any;
  lang: AppLanguage;
}) {
  useEffect(() => {
    if (!invoice) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [invoice, onClose]);

  if (!invoice) return null;

  const roomName = getRoomNameByInvoice(invoice, rooms, properties, lang);
  const tenant = tenants.find((tIdx) => tIdx.id === invoice.tenantId);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in printing-modal-wrapper"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 border border-border flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-4 bg-muted border-b border-border print:hidden shrink-0">
          <h3 className="font-bold text-foreground text-sm font-sans flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-primary" />
            {lang === 'en' ? 'Print Preview Voucher' : 'ទម្រង់បោះពុម្ពវិក្កយបត្រ'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <Printer className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Print Invoice' : 'បោះពុម្ពទម្រង់'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 font-sans print:p-0" id="rental-invoice-print-area">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-primary pb-6">
            <div>
              <h1 className="text-xl font-bold text-primary tracking-tight font-sans">
                {lang === 'en' ? 'RENTAL INVOICE' : 'វិក្កយបត្រថ្លៃឈ្នួល'}
              </h1>
              <h2 className="text-xs font-medium text-muted-foreground font-sans tracking-wide mt-1">
                {lang === 'en' ? 'PROPERTY LEASE RECEIPT' : 'បង្កាន់ដៃជួលអចលនទ្រព្យផ្លូវការ'}
              </h2>
              <p className="text-sm font-bold text-foreground mt-4 font-sans">
                {lang === 'en' ? 'Landlord Office:' : 'ការិយាល័យកណ្តាល៖'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm font-sans">
                {roomName.split('(')[1]?.replace(')', '') || 'Cambodia Property Ltd.'}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block p-1.5 px-3 bg-primary/10 text-primary font-mono text-xs font-bold rounded-lg border border-primary/20">
                {invoice.invoiceNumber}
              </div>
              <div className="mt-4 text-xs text-muted-foreground space-y-1 font-sans">
                <p>
                  {lang === 'en' ? 'Issue Date: ' : 'ថ្ងៃចេញវិក្កយបត្រ៖ '}
                  <span className="font-semibold text-foreground font-mono">{invoice.issueDate}</span>
                </p>
                <p>
                  {lang === 'en' ? 'Due Date: ' : 'ថ្ងៃត្រូវបង់ប្រាក់៖ '}
                  <span className="font-semibold text-destructive font-mono">{invoice.dueDate}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-6 border-b border-border text-xs font-sans">
            <div>
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                {lang === 'en' ? 'PREPARED FOR / ជូនចំពោះ៖' : 'ព័ត៌មានអ្នកជួល៖'}
              </p>
              <p className="text-sm font-bold text-foreground">{getTenantNameByInvoice(invoice, tenants, lang)}</p>
              <p className="text-muted-foreground mt-1">
                {lang === 'en' ? 'Contact Phone:' : 'លេខទូរស័ព្ទ៖'}{' '}
                <span className="font-mono text-foreground font-semibold">{tenant?.phone || 'N/A'}</span>
              </p>
              <p className="text-muted-foreground">
                {lang === 'en' ? 'NID/Passport:' : 'អត្តសញ្ញាណប័ណ្ណ៖'}{' '}
                <span className="font-mono text-foreground">{tenant?.nationalId || 'N/A'}</span>
              </p>
            </div>

            <div>
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                {lang === 'en' ? 'ROOM LOCATION / ទីតាំងបន្ទប់៖' : 'ទីតាំងជួលសរុប៖'}
              </p>
              <p className="text-sm font-bold text-foreground">
                {lang === 'en' ? 'Room Number: ' : 'បន្ទប់លេខ៖ '}
                <span className="text-primary font-mono">{roomName.split(' ')[0]}</span>
              </p>
              <p className="text-muted-foreground mt-1 font-sans">
                {lang === 'en' ? 'Floor level:' : 'ជាន់ទី៖'}{' '}
                <span className="font-mono text-foreground text-xs font-bold">
                  {rooms.find((r) => r.id === invoice.roomId)?.floor || 1}
                </span>
              </p>
              <p className="text-muted-foreground font-sans">
                {lang === 'en' ? 'Rent Month Cycle:' : 'វដ្តខែទូទាត់៖'}{' '}
                <span className="font-mono font-bold text-foreground">
                  {activeMonths.find((m) => m.value === invoice.month)?.label || invoice.month} / {invoice.year}
                </span>
              </p>
            </div>
          </div>

          <div className="py-6 font-sans overflow-x-auto scroll-x-hint print:overflow-visible">
            <table className="w-full min-w-[560px] text-left border-collapse text-xs print:min-w-0">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2.5 pb-3">No. / ល.រ</th>
                  <th className="py-2.5 pb-3">{lang === 'en' ? 'Item & Consumption Details / ការពិពណ៌នា' : 'លម្អិតមុខទំនិញ'}</th>
                  <th className="py-2.5 pb-3 text-right">{lang === 'en' ? 'Units / ប្រើ' : 'ចំនួន'}</th>
                  <th className="py-2.5 pb-3 text-right">{lang === 'en' ? 'Unit Rate / តម្លៃឯកតា' : 'ថ្លៃឯកតា'}</th>
                  <th className="py-2.5 pb-3 text-right">{lang === 'en' ? 'Subtotal (KHR) / សរុបជារៀល' : 'ជារៀល'}</th>
                  <th className="py-2.5 pb-3 text-right">{lang === 'en' ? 'Subtotal (USD) / សរុបជាដុល្លារ' : 'ជាដុល្លារ'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-sans text-foreground">
                <tr>
                  <td className="py-3.5 font-mono">1</td>
                  <td className="py-3.5">
                    <p className="font-bold text-foreground">{lang === 'en' ? 'Apartment Rental Fee' : 'ថ្លៃជួលបន្ទប់ប្រចាំខែ'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {lang === 'en' ? 'Fixed monthly base rate according to lease contract' : 'តម្លៃជួលថេរក្នុងកិច្ចសន្យា'}
                    </p>
                  </td>
                  <td className="py-3.5 text-right font-mono text-muted-foreground">1 {lang === 'en' ? 'Month' : 'ខែ'}</td>
                  <td className="py-3.5 text-right font-mono text-muted-foreground">${invoice.rentAmountUSD}</td>
                  <td className="py-3.5 text-right font-mono text-muted-foreground">
                    {formatKHR(invoice.rentAmountUSD * invoice.khmerExchangeRate)}
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-foreground">${invoice.rentAmountUSD.toFixed(2)}</td>
                </tr>

                <tr>
                  <td className="py-3.5 font-mono">2</td>
                  <td className="py-3.5">
                    <p className="font-bold text-foreground">{lang === 'en' ? 'Utility - Electricity Outlay' : 'ថ្លៃប្រើប្រាស់អគ្គិសនី (កុងទ័រភ្លើង)'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                      {lang === 'en' ? 'Reading Log:' : 'លេខកុងទ័រ៖'} {invoice.electricityPrev} ➔ {invoice.electricityCurr}
                    </p>
                  </td>
                  <td className="py-3.5 text-right font-mono text-muted-foreground">
                    {invoice.electricityCurr - invoice.electricityPrev} kWh
                  </td>
                  <td className="py-3.5 text-right font-mono text-muted-foreground">{invoice.electricityRateKHR} ៛</td>
                  <td className="py-3.5 text-right font-mono text-muted-foreground">{formatKHR(invoice.electricityCostKHR)}</td>
                  <td className="py-3.5 text-right font-mono font-bold text-foreground">${invoice.electricityCostUSD.toFixed(2)}</td>
                </tr>

                <tr>
                  <td className="py-3.5 font-mono">3</td>
                  <td className="py-3.5">
                    <p className="font-bold text-foreground">{lang === 'en' ? 'Utility - Clean Water' : 'ថ្លៃប្រើប្រាស់ទឹកស្អាត (កុងទ័រទឹក)'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                      {lang === 'en' ? 'Reading Log:' : 'លេខកុងទ័រ៖'} {invoice.waterPrev} ➔ {invoice.waterCurr}
                    </p>
                  </td>
                  <td className="py-3.5 text-right font-mono text-muted-foreground">
                    {invoice.waterCurr - invoice.waterPrev} m³
                  </td>
                  <td className="py-3.5 text-right font-mono text-muted-foreground">{invoice.waterRateKHR} ៛</td>
                  <td className="py-3.5 text-right font-mono text-muted-foreground">{formatKHR(invoice.waterCostKHR)}</td>
                  <td className="py-3.5 text-right font-mono font-bold text-foreground">${invoice.waterCostUSD.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border font-sans">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-2 flex flex-col justify-center items-center">
              <p className="text-[10px] font-bold text-primary tracking-wider uppercase">{t.bank_qr_placeholder}</p>
              <div className="bg-card p-2 rounded-lg border border-border relative shrink-0">
                <QrCode className="w-20 h-20 text-primary stroke-1" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 text-white font-sans font-bold text-[8px] p-0.5 px-1 rounded-sm shadow-xs tracking-tight">
                    ABA
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground font-bold text-center tracking-tight">
                PAY ROUTE: <span className="font-mono text-primary font-bold">SOK_CHAMROEUN_ABA_9999</span>
              </p>
            </div>

            <div className="space-y-3 font-sans">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{lang === 'en' ? 'Cambodian EXCHANGE RATE:' : 'អត្រាប្តូរប្រាក់ផ្លូវការ៖'}</span>
                <span className="font-mono font-semibold text-foreground">1 USD = {invoice.khmerExchangeRate} KHR</span>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                <span>{lang === 'en' ? 'Amount Billed Paid (USD):' : 'ប្រាក់បានបង់រួច (USD)៖'}</span>
                <span className="font-mono font-bold text-primary">${invoice.amountPaidUSD.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-muted border border-border rounded-xl space-y-1.5 mt-2">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  {lang === 'en' ? 'GRAND TOTALS BALANCE DUE:' : 'តុល្យការប្រាក់សរុបត្រូវទូទាត់៖'}
                </p>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-muted-foreground">{lang === 'en' ? 'In Dollars (USD):' : 'គិតជាដុល្លារ (USD)៖'}</span>
                  <span className="font-mono text-lg font-bold text-foreground">{formatUSD(invoice.totalAmountUSD)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted-foreground">{lang === 'en' ? 'In Riels (KHR):' : 'គិតជារៀល (KHR)៖'}</span>
                  <span className="font-mono text-sm font-bold text-primary">{formatKHR(invoice.totalAmountKHR)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs text-muted-foreground font-sans mt-8 border-t border-dashed border-border">
            <div className="space-y-12">
              <p className="font-semibold uppercase tracking-wider text-[9px] text-muted-foreground">{t.landlord_sig}</p>
              <div className="pt-2 border-t border-border mx-8"></div>
            </div>
            <div className="space-y-12">
              <p className="font-semibold uppercase tracking-wider text-[9px] text-muted-foreground">{t.tenant_sig}</p>
              <div className="pt-2 border-t border-border mx-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
