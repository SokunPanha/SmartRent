import { useTranslations } from 'next-intl';
import { AppLanguage } from '@/lib/types';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoicesController } from '../use-invoices-controller';

type Controller = ReturnType<typeof useInvoicesController>;

export function PaymentModal({ c, lang }: { c: Controller; lang: AppLanguage }) {
  const t = useTranslations('Invoices');
  const tCommon = useTranslations('Common');
  return (
    <Modal open={c.showPaymentModal} onClose={c.closePaymentModal} size="sm">
      <ModalHeader title={t('record_payment')} onClose={c.closePaymentModal} />

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
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm font-mono font-bold focus:border-chart-2 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-sans">
              System Payment gateway *
            </label>
            <Select
              value={c.payMethod}
              onValueChange={(v) => c.setPayMethod(v as typeof c.payMethod)}
            >
              <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-sm font-sans font-semibold focus-visible:border-chart-2 focus-visible:ring-chart-2/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aba">ABA Fast QR / ABA Pay</SelectItem>
                <SelectItem value="cash">Hard Cash / ប្រាក់សុទ្ធ</SelectItem>
                <SelectItem value="wing">Wing Transfer / វីង</SelectItem>
                <SelectItem value="other">Other / ផ្សេងៗ</SelectItem>
              </SelectContent>
            </Select>
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
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:border-chart-2 focus:outline-none"
            />
          </div>
        </div>

        <ModalFooter
          cancelLabel={tCommon('cancel')}
          onCancel={c.closePaymentModal}
          submitLabel={t('record_payment_button')}
          tone="success"
        />
      </form>
    </Modal>
  );
}
