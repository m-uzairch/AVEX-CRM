import { describe, it, expect } from 'vitest';
import {
  sanitizeClientInvoice,
  sanitizeClientQuotation,
  calculateInvoiceKpis,
  calculateQuotationKpis,
  resolvePaymentStatusSummary,
  sanitizeFinancialItems,
} from '../services/portal-financial-helper';
import { generateInvoicePdf, generateQuotationPdf } from '@/lib/pdf/pdf-generator';

describe('Client Invoices & Quotations Unit Tests', () => {
  const mockCompany = {
    id: 'comp-1',
    name: 'Avex Technologies Inc.',
    email: 'billing@avextech.com',
    phone: '+1 800 555 0199',
    address: '100 Innovation Way',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'USA',
    branding: {
      companyName: 'Avex Technologies',
      taxNumber: 'US-987654321',
      logoUrl: 'https://cdn.avex.io/logo.png',
    },
  };

  const mockCustomer = {
    id: 'cust-1',
    name: 'John Doe',
    companyName: 'Acme Corp',
    email: 'john@acme.com',
    phone: '+1 555 123 4567',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    zip: '97477',
    country: 'USA',
    internalSalesRating: 'AAA',
    privateCreditNotes: 'High credit risk, always verify bank wire',
  };

  const mockItems = [
    {
      id: 'item-1',
      name: 'UI/UX Design Phase',
      description: 'Wireframing and Figma prototypes',
      quantity: 1,
      unitPrice: 5000,
      discountRate: 0,
      taxRate: 10,
      lineTotal: 5500,
      internalCostPerUnit: 2000,
      contractorPayout: 1500,
    },
    {
      id: 'item-2',
      name: 'Full-Stack Development',
      description: 'Next.js & PostgreSQL implementation',
      quantity: 2,
      unitPrice: 7500,
      discountRate: 5,
      taxRate: 10,
      lineTotal: 15675,
      internalCostPerUnit: 3500,
    },
  ];

  describe('1. sanitizeFinancialItems', () => {
    it('sanitizes line items and removes internal cost data', () => {
      const sanitized = sanitizeFinancialItems(mockItems);

      expect(sanitized).toHaveLength(2);
      expect(sanitized[0].name).toBe('UI/UX Design Phase');
      expect(sanitized[0].quantity).toBe(1);
      expect(sanitized[0].unitPrice).toBe(5000);

      // Verify internal cost leaks are prevented
      expect((sanitized[0] as any).internalCostPerUnit).toBeUndefined();
      expect((sanitized[0] as any).contractorPayout).toBeUndefined();
    });
  });

  describe('2. resolvePaymentStatusSummary', () => {
    it('returns "Paid in Full" when status is PAID or balance is 0', () => {
      expect(resolvePaymentStatusSummary('PAID', new Date(), 0)).toBe('Paid in Full');
      expect(resolvePaymentStatusSummary('SENT', new Date(), 0)).toBe('Paid in Full');
    });

    it('returns "Invoice Cancelled" when status is CANCELLED', () => {
      expect(resolvePaymentStatusSummary('CANCELLED', new Date(), 1000)).toBe('Invoice Cancelled');
    });

    it('returns "Overdue by X days" for past due date', () => {
      const pastDue = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const summary = resolvePaymentStatusSummary('SENT', pastDue, 5000);
      expect(summary).toContain('Overdue');
    });

    it('returns "Due in X days" for future due date', () => {
      const futureDue = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const summary = resolvePaymentStatusSummary('SENT', futureDue, 5000);
      expect(summary).toContain('Due in');
    });
  });

  describe('3. sanitizeClientInvoice', () => {
    const rawInvoice = {
      id: 'inv-101',
      invoiceNumber: 'INV-00101',
      status: 'PARTIALLY_PAID',
      subtotal: 20000,
      discountAmount: 1000,
      taxAmount: 1900,
      grandTotal: 20900,
      amountPaid: 10000,
      remainingBalance: 10900,
      currency: 'USD',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date('2026-08-01'),
      notes: 'Standard payment terms net-15',
      termsConditions: 'Interest of 1.5% applies to overdue balances',
      internalNotes: 'Customer requested 2-part split payment',
      company: mockCompany,
      customer: mockCustomer,
      items: mockItems,
      payments: [
        {
          id: 'pay-1',
          amount: 10000,
          paymentDate: new Date('2026-08-10'),
          paymentMethod: 'BANK_TRANSFER',
          referenceNumber: 'WIRE-889922',
          notes: 'First installment received',
          internalNotes: 'Verified with Chase treasury',
          recordedById: 'usr-99',
        },
      ],
    };

    it('formats invoice and removes sensitive internal fields', () => {
      const sanitized = sanitizeClientInvoice(rawInvoice);

      expect(sanitized.invoiceNumber).toBe('INV-00101');
      expect(sanitized.totalAmount).toBe(20900);
      expect(sanitized.amountPaid).toBe(10000);
      expect(sanitized.balanceDue).toBe(10900);
      expect(sanitized.payments).toHaveLength(1);
      expect(sanitized.payments![0].referenceNumber).toBe('WIRE-889922');

      // Check customer privacy
      expect((sanitized.customer as any).privateCreditNotes).toBeUndefined();
      expect((sanitized.customer as any).internalSalesRating).toBeUndefined();

      // Check payment internal privacy
      expect((sanitized.payments![0] as any).internalNotes).toBeUndefined();
      expect((sanitized.payments![0] as any).recordedById).toBeUndefined();
    });
  });

  describe('4. sanitizeClientQuotation', () => {
    const rawQuotation = {
      id: 'qtn-201',
      quoteNumber: 'QTN-00201',
      title: 'E-Commerce Platform Rebuild',
      status: 'SENT',
      subtotal: 15000,
      discountAmount: 500,
      taxAmount: 1450,
      grandTotal: 15950,
      currency: 'USD',
      quoteDate: new Date('2026-08-15'),
      expiryDate: new Date('2026-09-15'),
      notes: 'Includes 3 months warranty support',
      termsConditions: '50% upfront, 50% upon milestone completion',
      internalEstimatorNotes: 'Margin calculated at 42%',
      company: mockCompany,
      customer: mockCustomer,
      items: mockItems,
    };

    it('formats quotation cleanly without leaking estimator margins', () => {
      const sanitized = sanitizeClientQuotation(rawQuotation);

      expect(sanitized.quotationNumber).toBe('QTN-00201');
      expect(sanitized.totalAmount).toBe(15950);
      expect(sanitized.status).toBe('SENT');
      expect(sanitized.items).toHaveLength(2);

      // Verify privacy
      expect((sanitized as any).internalEstimatorNotes).toBeUndefined();
    });
  });

  describe('5. KPI Calculations', () => {
    it('accurately computes invoice KPI aggregates', () => {
      const sampleInvoices: any[] = [
        { status: 'PAID', totalAmount: 10000, amountPaid: 10000, balanceDue: 0 },
        { status: 'SENT', totalAmount: 5000, amountPaid: 2000, balanceDue: 3000, paymentStatusSummary: 'Due in 5 days' },
        { status: 'OVERDUE', totalAmount: 8000, amountPaid: 0, balanceDue: 8000, paymentStatusSummary: 'Overdue by 3 days' },
      ];

      const kpis = calculateInvoiceKpis(sampleInvoices);

      expect(kpis.totalBilled).toBe(23000);
      expect(kpis.totalPaid).toBe(12000);
      expect(kpis.totalOutstanding).toBe(11000);
      expect(kpis.paidCount).toBe(1);
      expect(kpis.overdueCount).toBe(1);
    });

    it('accurately computes quotation KPI aggregates', () => {
      const sampleQuotes: any[] = [
        { status: 'ACCEPTED', totalAmount: 25000 },
        { status: 'SENT', totalAmount: 15000 },
        { status: 'EXPIRED', totalAmount: 10000 },
      ];

      const kpis = calculateQuotationKpis(sampleQuotes);

      expect(kpis.totalQuotes).toBe(3);
      expect(kpis.acceptedCount).toBe(1);
      expect(kpis.pendingCount).toBe(1);
      expect(kpis.expiredCount).toBe(1);
      expect(kpis.totalPipelineValue).toBe(50000);
    });
  });

  describe('6. PDF Generation Integration', () => {
    it('generates valid PDF buffer for Invoices', () => {
      const invoiceData = {
        invoiceNumber: 'INV-7788',
        grandTotal: 12500,
        currency: 'USD',
        dueDate: '2026-09-30',
        customer: { name: 'Acme Corp' },
      };

      const result = generateInvoicePdf(invoiceData);

      expect(result.filename).toBe('Invoice_INV-7788.pdf');
      expect(result.contentType).toBe('application/pdf');
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.sizeBytes).toBeGreaterThan(100);
    });

    it('generates valid PDF buffer for Quotations', () => {
      const quotationData = {
        quoteNumber: 'QTN-9988',
        grandTotal: 18000,
        currency: 'USD',
        expiryDate: '2026-10-15',
        customer: { name: 'Beta Ltd' },
      };

      const result = generateQuotationPdf(quotationData);

      expect(result.filename).toBe('Quotation_QTN-9988.pdf');
      expect(result.contentType).toBe('application/pdf');
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.sizeBytes).toBeGreaterThan(100);
    });
  });
});
