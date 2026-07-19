import { useTranslations } from 'next-intl';
import { Modal } from '@/components/shared/Modal';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getActiveMonths } from '../invoices.helpers';
import { useInvoicesController } from '../use-invoices-controller';

type Controller = ReturnType<typeof useInvoicesController>;

/** Period picker shown before generating invoices. Lets the user choose the
 *  billing year + month (defaulting to the current month) rather than the
 *  feature being pinned to a fixed period. */
export function GenerateInvoiceModal({ c }: { c: Controller }) {
  const t = useTranslations('Invoices');
  const tCommon = useTranslations('Common');
  const months = getActiveMonths(t);

  return (
    <Modal open={c.showGenerateModal} onClose={c.closeGenerateModal} size="sm">
      <ModalHeader title={t('generate_dialog_title')} onClose={c.closeGenerateModal} />

      <form onSubmit={c.handleSubmitGenerate} className="p-4 space-y-4 text-xs">
        <p className="text-muted-foreground font-sans leading-relaxed">
          {t('generate_dialog_desc')}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-medium text-muted-foreground font-sans">
              {t('generate_year_label')}
            </label>
            <Select
              value={String(c.genYear)}
              onValueChange={(v) => c.setGenYear(Number(v))}
            >
              <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-sm font-sans font-semibold focus-visible:border-primary focus-visible:ring-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {c.generateYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-muted-foreground font-sans">
              {t('generate_month_label')}
            </label>
            <Select
              value={String(c.genMonth)}
              onValueChange={(v) => c.setGenMonth(Number(v))}
            >
              <SelectTrigger className="w-full data-[size=default]:h-auto px-3 py-2.5 rounded-lg bg-card text-sm font-sans font-semibold focus-visible:border-primary focus-visible:ring-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ModalFooter
          cancelLabel={tCommon('cancel')}
          onCancel={c.closeGenerateModal}
          submitLabel={t('generate_run_button')}
        />
      </form>
    </Modal>
  );
}
