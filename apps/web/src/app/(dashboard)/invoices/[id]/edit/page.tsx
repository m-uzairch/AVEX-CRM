/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { InvoiceBuilderForm } from '@/features/invoices/components/invoice-builder-form';
import { Invoice } from '@/features/invoices/types/invoice-types';
import { Loader2 } from 'lucide-react';

export default function EditInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (invoiceId) {
      fetch(`/api/invoices/${invoiceId}`)
        .then((res) => res.json())
        .then((data) => {
          setInvoice(data.invoice);
        })
        .catch((err) => console.error('Failed to load invoice:', err))
        .finally(() => setIsLoading(false));
    }
  }, [invoiceId]);

  if (isLoading || !invoice) {
    return (
      <ContentContainer>
        <div className="py-12 text-center text-muted-foreground text-xs">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
          Loading invoice data for editing...
        </div>
      </ContentContainer>
    );
  }

  const initialValues = {
    customerId: invoice.customerId,
    projectId: invoice.projectId || undefined,
    salesRepId: invoice.salesRepId || undefined,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    currency: invoice.currency,
    notes: invoice.notes || undefined,
    termsConditions: invoice.termsConditions || undefined,
    items: (invoice.items || []).map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description || undefined,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discountRate: i.discountRate,
      taxRate: i.taxRate,
      lineTotal: i.lineTotal,
      sortOrder: i.sortOrder,
    })),
    invoiceNumber: invoice.invoiceNumber,
  };

  return (
    <ContentContainer>
      <PageHeader
        title={`Edit Invoice ${invoice.invoiceNumber}`}
        description="Update line items, tax rates, discount amounts, and status for this invoice."
        breadcrumbs={[
          { label: 'Invoices', href: '/invoices' },
          { label: invoice.invoiceNumber, href: `/invoices/${invoice.id}` },
          { label: 'Edit' },
        ]}
      />

      <div className="mt-4">
        <InvoiceBuilderForm initialValues={initialValues} invoiceId={invoice.id} />
      </div>
    </ContentContainer>
  );
}
