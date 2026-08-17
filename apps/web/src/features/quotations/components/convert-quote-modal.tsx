/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Quotation } from '../types/quotation-types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FolderPlus, FileSpreadsheet, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface ConvertQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
  onConverted: () => void;
}

export function ConvertQuoteModal({
  isOpen,
  onClose,
  quotation,
  onConverted,
}: ConvertQuoteModalProps) {
  const router = useRouter();
  const toastCtx = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [convertType, setConvertType] = React.useState<'PROJECT' | 'INVOICE'>('PROJECT');

  const handleConvert = async () => {
    setIsSubmitting(true);
    try {
      const endpoint =
        convertType === 'PROJECT'
          ? `/api/quotations/${quotation.id}/convert-project`
          : `/api/quotations/${quotation.id}/convert-invoice`;

      const res = await fetch(endpoint, { method: 'POST' });

      if (res.ok) {
        const data = await res.json();
        if (convertType === 'PROJECT') {
          toastCtx.success(
            'Converted to Project',
            `Created project ${data.project.projectCode} from quotation ${quotation.quoteNumber}.`
          );
          onConverted();
          onClose();
          router.push(`/projects/${data.project.id}`);
        } else {
          toastCtx.success(
            'Converted to Invoice',
            `Created draft invoice ${data.invoice.invoiceNumber} from quotation ${quotation.quoteNumber}.`
          );
          onConverted();
          onClose();
          router.push(`/invoices/${data.invoice.id}`);
        }
      } else {
        const err = await res.json();
        toastCtx.error('Conversion Failed', err.error || 'Unable to convert quotation.');
      }
    } catch (err) {
      console.error('Convert quotation failed:', err);
      toastCtx.error('Conversion Error', 'Failed to convert quotation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Convert Quotation ${quotation.quoteNumber}`}
      description={`Convert accepted estimate ($${quotation.grandTotal.toFixed(2)}) directly into a Project workspace or draft Invoice without re-entering data.`}
    >
      <div className="space-y-3 py-2 text-xs">
        <div
          onClick={() => setConvertType('PROJECT')}
          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
            convertType === 'PROJECT'
              ? 'border-primary bg-primary/5 text-primary font-bold'
              : 'border-border bg-background text-muted-foreground hover:border-primary/40'
          }`}
        >
          <FolderPlus className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
          <div>
            <div className="text-sm font-bold text-foreground">Convert to Active Project</div>
            <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
              Creates a new Project workspace, transfers scope items, budget (${quotation.grandTotal}), and links customer.
            </div>
          </div>
        </div>

        <div
          onClick={() => setConvertType('INVOICE')}
          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
            convertType === 'INVOICE'
              ? 'border-primary bg-primary/5 text-primary font-bold'
              : 'border-border bg-background text-muted-foreground hover:border-primary/40'
          }`}
        >
          <FileSpreadsheet className="h-5 w-5 mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <div className="text-sm font-bold text-foreground">Convert to Draft Invoice</div>
            <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
              Generates a draft Invoice with sequential invoice number, line items, taxes, and totals for client billing.
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8.5 text-xs">
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleConvert}
          disabled={isSubmitting}
          className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
          <span>Convert Now</span>
        </Button>
      </div>
    </Dialog>
  );
}
