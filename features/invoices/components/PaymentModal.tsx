import { X } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { useInvoicesController } from '../use-invoices-controller';

type Controller = ReturnType<typeof useInvoicesController>;

export function PaymentModal({ c, t, lang }: { c: Controller; t: any; lang: AppLanguage }) {
  return (
    <Modal open={c.showPaymentModal} onClose={c.closePaymentModal} size="sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-bold text-foreground text-base font-sans">{t.record_payment}</h3>
        <button
          onClick={c.closePaymentModal}
          className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-muted-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={c.handleSubmitPayment} className="p-4 space-y-4 text-xs">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              Payment Amount Code (USD) *
            </label>
            <input
              type="number"
              value={c.payAmount}
              onChange={(e) => c.setPayAmount(Number(e.target.value))}
              min={0.01}
              max={10000}
              step={0.01}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm font-mono font-bold focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              System Payment gateway *
            </label>
            <select
              value={c.payMethod}
              onChange={(e) => c.setPayMethod(e.target.value as typeof c.payMethod)}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-emerald-500 focus:outline-none bg-card font-sans font-semibold"
            >
              <option value="aba">ABA Fast QR / ABA Pay</option>
              <option value="cash">Hard Cash / ប្រាក់សុទ្ធ</option>
              <option value="wing">Wing Transfer / វីង</option>
              <option value="other">Other / ផ្សេងៗ</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              Payment Remarks / Notes
            </label>
            <input
              type="text"
              value={c.payNotes}
              onChange={(e) => c.setPayNotes(e.target.value)}
              placeholder="e.g. Paid online through ABA KHQR barcode"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={c.closePaymentModal}
            className="flex-1 py-2 rounded-lg text-sm border border-border hover:bg-muted transition cursor-pointer font-sans"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition font-semibold cursor-pointer font-sans text-center"
          >
            {lang === 'en' ? 'Record Payment' : 'បញ្ជាក់ការបង់ប្រាក់'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
