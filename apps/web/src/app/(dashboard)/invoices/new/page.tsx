/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { InvoiceBuilderForm } from '@/features/invoices/components/invoice-builder-form';

export default function CreateInvoicePage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Create New Invoice"
        description="Draft and issue a new customer invoice with live preview, line items, taxes, discounts, and real-time total calculations."
        breadcrumbs={[{ label: 'Invoices', href: '/invoices' }, { label: 'Create Invoice' }]}
      />

      <div className="mt-4">
        <InvoiceBuilderForm />
      </div>
    </ContentContainer>
  );
}
