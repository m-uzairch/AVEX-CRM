/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { QuotationBuilderForm } from '@/features/quotations/components/quotation-builder-form';
import { Quotation } from '@/features/quotations/types/quotation-types';
import { Loader2 } from 'lucide-react';

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quotation, setQuotation] = React.useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/quotations/${id}`);
        if (res.ok) {
          const data = await res.json();
          setQuotation(data.quotation);
        } else {
          router.push('/quotations');
        }
      } catch (err) {
        console.error('Failed to load quotation for edit:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  if (isLoading) {
    return (
      <ContentContainer>
        <div className="py-12 text-center text-muted-foreground text-xs">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
          Loading quotation for editing...
        </div>
      </ContentContainer>
    );
  }

  if (!quotation) return null;

  return (
    <ContentContainer>
      <PageHeader
        title={`Edit Quotation ${quotation.quoteNumber}`}
        description={`Updating version ${quotation.version + 1} for ${quotation.customer?.companyName || quotation.customer?.name || 'Customer'}`}
        breadcrumbs={[
          { label: 'Quotations', href: '/quotations' },
          { label: quotation.quoteNumber, href: `/quotations/${quotation.id}` },
          { label: 'Edit' },
        ]}
      />

      <div className="mt-4">
        <QuotationBuilderForm
          initialValues={{
            customerId: quotation.customerId,
            leadId: quotation.leadId || undefined,
            salesRepId: quotation.salesRepId || undefined,
            estimateType: quotation.estimateType,
            quoteDate: quotation.quoteDate,
            expiryDate: quotation.expiryDate,
            currency: quotation.currency,
            status: quotation.status,
            notes: quotation.notes || undefined,
            termsConditions: quotation.termsConditions || undefined,
            items: (quotation.items || []).map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description || undefined,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountRate: item.discountRate,
              taxRate: item.taxRate,
              lineTotal: item.lineTotal,
            })),
          }}
          quotationId={quotation.id}
          isEditing={true}
        />
      </div>
    </ContentContainer>
  );
}
