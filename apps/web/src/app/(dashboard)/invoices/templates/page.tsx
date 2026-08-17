/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { InvoiceTemplateGallery } from '@/features/invoices/components/designer/invoice-template-gallery';
import { InvoiceDesignerEditor } from '@/features/invoices/components/designer/invoice-designer-editor';
import { InvoiceTemplate, CompanyBranding } from '@/features/invoices/types/invoice-template-types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export default function InvoiceDesignerPage() {
  const toastCtx = useToast();
  const [templates, setTemplates] = React.useState<InvoiceTemplate[]>([]);
  const [branding, setBranding] = React.useState<CompanyBranding>({
    companyId: 'comp_001',
    companyName: 'AVEX Enterprise',
    taxNumber: 'TAX-98402941',
    website: 'www.avexcrm.io',
    phone: '+1 (800) 555-0199',
    email: 'billing@avexcrm.io',
    address: '100 Innovation Way, Suite 400',
    city: 'Tech City',
    state: 'CA',
    zip: '94016',
    country: 'United States',
  });
  const [selectedTemplate, setSelectedTemplate] = React.useState<InvoiceTemplate | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchTemplatesAndBranding = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [resTpl, resBrand] = await Promise.all([
        fetch('/api/invoices/templates'),
        fetch('/api/invoices/branding'),
      ]);

      if (resTpl.ok) {
        const data = await resTpl.json();
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
        }
      }
      if (resBrand.ok) {
        const data = await resBrand.json();
        if (data.branding) {
          setBranding(data.branding);
        }
      }
    } catch (err) {
      console.error('Failed to load designer data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTemplatesAndBranding();
  }, [fetchTemplatesAndBranding]);

  const handleCreateNewCustom = async () => {
    try {
      const res = await fetch('/api/invoices/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Custom Invoice Template',
          layoutStyle: 'MODERN',
          isDefault: false,
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          fontFamily: 'Inter',
          fontSize: 'NORMAL',
          logoPosition: 'LEFT',
          headerAlignment: 'LEFT',
          showCompanyAddress: true,
          showPhone: true,
          showEmail: true,
          showWebsite: true,
          showTaxNumber: true,
          visibleColumns: ['name', 'description', 'qty', 'price', 'discount', 'tax', 'total'],
          visibleSummaryFields: ['subtotal', 'discount', 'tax', 'grandTotal', 'amountPaid', 'balance'],
          thankYouMessage: 'Thank you for your business!',
          footerText: 'AVEX CRM Workspace Invoice',
          defaultTerms: 'Net 14 days.',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toastCtx.success('New Template Created', 'Custom template created and ready for customization.');
        await fetchTemplatesAndBranding();
        if (data.template) setSelectedTemplate(data.template);
      }
    } catch (err) {
      console.error('Failed to create new template:', err);
    }
  };

  if (isLoading) {
    return (
      <ContentContainer>
        <div className="py-12 text-center text-muted-foreground text-xs">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
          Loading Invoice Designer workspace...
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Invoice Designer & Template Builder"
        description="Configure company branding, colors, typography, column visibility, and header/footer alignment with an instant live preview."
        breadcrumbs={[{ label: 'Invoices', href: '/invoices' }, { label: 'Invoice Designer' }]}
        actions={
          <Link href="/invoices">
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Invoices</span>
            </Button>
          </Link>
        }
      />

      <div className="mt-4">
        {selectedTemplate ? (
          <InvoiceDesignerEditor
            template={selectedTemplate}
            branding={branding}
            onSaveSuccess={() => {
              setSelectedTemplate(null);
              fetchTemplatesAndBranding();
            }}
            onCancel={() => setSelectedTemplate(null)}
          />
        ) : (
          <InvoiceTemplateGallery
            templates={templates}
            onSelectTemplate={(tpl) => setSelectedTemplate(tpl)}
            onRefresh={fetchTemplatesAndBranding}
            onCreateNew={handleCreateNewCustom}
          />
        )}
      </div>
    </ContentContainer>
  );
}
