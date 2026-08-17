/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { QuotationPreviewCard } from '@/features/quotations/components/quotation-preview-card';
import { ConvertQuoteModal } from '@/features/quotations/components/convert-quote-modal';
import { VersionHistoryModal } from '@/features/quotations/components/version-history-modal';
import { EmailQuotationModal } from '@/features/quotations/components/email-quotation-modal';
import { Quotation } from '@/features/quotations/types/quotation-types';
import { Button } from '@/components/ui/button';
import {
  Printer,
  Mail,
  Edit,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  History,
  FolderPlus,
  Download,
} from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export default function QuotationDetailPage() {
  const params = useParams();
  const toastCtx = useToast();
  const id = params.id as string;

  const [quotation, setQuotation] = React.useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Modals state
  const [isConvertModalOpen, setIsConvertModalOpen] = React.useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);

  const fetchQuotation = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/quotations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuotation(data.quotation);
      } else {
        toastCtx.error('Not Found', 'Quotation not found.');
      }
    } catch (err) {
      console.error('Failed to fetch quotation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchQuotation();
  }, [fetchQuotation]);

  const handlePrint = () => {
    window.open(`/api/quotations/${id}/pdf?print=true`, '_blank');
  };

  const handleDownloadPDF = () => {
    window.open(`/api/quotations/${id}/pdf?download=true`, '_blank');
  };



  const handleClientResponse = async (status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/quotations/${id}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback: `Client marked quotation as ${status.toLowerCase()}.` }),
      });

      if (res.ok) {
        toastCtx.success('Status Updated', `Quotation status updated to ${status}.`);
        fetchQuotation();
      }
    } catch (err) {
      console.error('Status response error:', err);
    }
  };

  if (isLoading) {
    return (
      <ContentContainer>
        <div className="py-12 text-center text-muted-foreground text-xs">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
          Loading quotation details...
        </div>
      </ContentContainer>
    );
  }

  if (!quotation) {
    return (
      <ContentContainer>
        <div className="py-12 text-center text-muted-foreground text-xs space-y-3">
          <div>Quotation not found.</div>
          <Link href="/quotations">
            <Button size="sm" variant="outline">
              Back to Quotations
            </Button>
          </Link>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title={`Quotation ${quotation.quoteNumber}`}
        description={`Status: ${quotation.status} • Total: $${quotation.grandTotal.toFixed(2)}`}
        breadcrumbs={[{ label: 'Quotations', href: '/quotations' }, { label: quotation.quoteNumber }]}
        actions={
          <div className="flex items-center space-x-2">
            <Link href="/quotations">
              <Button variant="outline" size="sm" className="h-8.5 text-xs gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Button>
            </Link>

            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="h-8.5 text-xs gap-1.5 border-primary/30 text-primary">
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handlePrint} className="h-8.5 text-xs gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              <span>Print Document</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEmailModalOpen(true)}
              className="h-8.5 text-xs gap-1.5"
            >
              <Mail className="h-3.5 w-3.5 text-purple-600" />
              <span>Email Quote</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryModalOpen(true)}
              className="h-8.5 text-xs gap-1.5"
            >
              <History className="h-3.5 w-3.5 text-blue-600" />
              <span>Version History (v{quotation.version})</span>
            </Button>

            {(quotation.status === 'ACCEPTED' || quotation.status === 'CONVERTED') && (
              <Button
                size="sm"
                onClick={() => setIsConvertModalOpen(true)}
                className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Convert to Project / Invoice</span>
              </Button>
            )}

            <Link href={`/quotations/${quotation.id}/edit`}>
              <Button size="sm" variant="secondary" className="h-8.5 text-xs gap-1.5">
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Quick Actions & Status Banner */}
      <div className="mt-4 space-y-4">
        {quotation.status !== 'ACCEPTED' && quotation.status !== 'CONVERTED' && (
          <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-2xs text-xs">
            <span className="font-semibold text-muted-foreground">
              Simulate Client Approval Response:
            </span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => handleClientResponse('ACCEPTED')}
                className="h-7 px-3 text-xs bg-emerald-600 text-white font-bold gap-1"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Accept Quote</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleClientResponse('REJECTED')}
                className="h-7 px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 font-bold gap-1"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject Quote</span>
              </Button>
            </div>
          </div>
        )}

        {/* Live Printable Quotation Card */}
        <QuotationPreviewCard quotation={quotation} />
      </div>

      {/* Modals */}
      {isEmailModalOpen && (
        <EmailQuotationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          quotationId={quotation.id}
          quoteNumber={quotation.quoteNumber}
          customerEmail={quotation.customer?.email}
          customerName={quotation.customer?.name}
          grandTotal={quotation.grandTotal}
          expiryDate={quotation.expiryDate}
          onEmailSent={fetchQuotation}
        />
      )}

      {isConvertModalOpen && (
        <ConvertQuoteModal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          quotation={quotation}
          onConverted={fetchQuotation}
        />
      )}

      {isHistoryModalOpen && (
        <VersionHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          versions={quotation.versions || []}
          quoteNumber={quotation.quoteNumber}
        />
      )}
    </ContentContainer>
  );
}
