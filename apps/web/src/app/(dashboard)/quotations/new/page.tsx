/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { QuotationBuilderForm } from '@/features/quotations/components/quotation-builder-form';

export default function CreateQuotationPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Create Quotation Estimate"
        description="Build cost estimate with itemized deliverables, discounts, taxes, and validity expiry dates."
        breadcrumbs={[{ label: 'Quotations', href: '/quotations' }, { label: 'New Quotation' }]}
      />

      <div className="mt-4">
        <QuotationBuilderForm />
      </div>
    </ContentContainer>
  );
}
