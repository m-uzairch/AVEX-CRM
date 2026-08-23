/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ClientInvoice,
  ClientQuotation,
  ClientCompanyInfo,
  ClientCustomerInfo,
  ClientFinancialItem,
  ClientInvoicePaymentRecord,
} from '../types/portal-types';

/**
 * Extracts and sanitizes company branding and contact information for client documents.
 */
export function extractClientCompanyInfo(company: any): ClientCompanyInfo {
  if (!company) {
    return { name: 'AVEX CRM' };
  }

  const branding = company.branding || {};

  return {
    name: branding.companyName || company.name || 'AVEX CRM',
    email: branding.email || company.email || null,
    phone: branding.phone || company.phone || null,
    website: branding.website || company.website || null,
    address: branding.address || company.address || null,
    city: branding.city || company.city || null,
    state: branding.state || company.state || null,
    zip: branding.zip || company.zip || null,
    country: branding.country || company.country || null,
    logoUrl: branding.logoUrl || company.logo || null,
    taxNumber: branding.taxNumber || null,
  };
}

/**
 * Extracts and sanitizes customer contact and billing information.
 * Strictly excludes internal sales notes or credit ratings.
 */
export function extractClientCustomerInfo(customer: any): ClientCustomerInfo {
  if (!customer) {
    return { name: 'Valued Customer' };
  }

  return {
    name: customer.name || 'Valued Customer',
    companyName: customer.companyName || customer.company || null,
    email: customer.email || null,
    phone: customer.phone || null,
    address: customer.address || null,
    city: customer.city || null,
    state: customer.state || null,
    zip: customer.zip || null,
    country: customer.country || null,
  };
}

/**
 * Sanitizes line items for invoices and quotations.
 * Strips internal cost-per-unit or contractor payouts.
 */
export function sanitizeFinancialItems(items: any[] = []): ClientFinancialItem[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    id: item.id,
    name: item.name || 'Service Item',
    description: item.description || null,
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unitPrice) || 0,
    discountRate: Number(item.discountRate) || 0,
    taxRate: Number(item.taxRate) || 0,
    lineTotal: Number(item.lineTotal) || (Number(item.quantity || 1) * Number(item.unitPrice || 0)),
    sortOrder: item.sortOrder ?? 0,
  }));
}

/**
 * Resolves a human-friendly payment status summary for an invoice.
 */
export function resolvePaymentStatusSummary(
  status: string,
  dueDate: Date | string,
  balanceDue: number
): string {
  if (status === 'PAID' || balanceDue <= 0) {
    return 'Paid in Full';
  }

  if (status === 'CANCELLED') {
    return 'Invoice Cancelled';
  }

  const now = new Date();
  const due = dueDate instanceof Date ? dueDate : new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`;
  }

  if (diffDays === 0) {
    return 'Payment Due Today';
  }

  return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
}

/**
 * Sanitizes a single Invoice database record for client consumption.
 */
export function sanitizeClientInvoice(invoice: any): ClientInvoice {
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const company = extractClientCompanyInfo(invoice.company);
  const customer = extractClientCustomerInfo(invoice.customer);
  const items = sanitizeFinancialItems(invoice.items || []);

  const rawPayments = invoice.payments || [];
  const payments: ClientInvoicePaymentRecord[] = rawPayments
    .filter((p: any) => !p.deletedAt)
    .map((p: any) => ({
      id: p.id,
      amount: Number(p.amount) || 0,
      paymentDate: p.paymentDate
        ? (p.paymentDate instanceof Date ? p.paymentDate.toISOString() : String(p.paymentDate))
        : new Date().toISOString(),
      paymentMethod: p.paymentMethod || 'BANK_TRANSFER',
      referenceNumber: p.referenceNumber || null,
      notes: p.notes || null, // Customer visible note only
    }));

  const subtotal = Number(invoice.subtotal) || 0;
  const discountAmount = Number(invoice.discountAmount) || 0;
  const taxAmount = Number(invoice.taxAmount) || 0;
  const totalAmount = Number(invoice.grandTotal ?? invoice.totalAmount) || 0;
  const amountPaid = Number(invoice.amountPaid) || 0;
  const balanceDue = Number(invoice.remainingBalance ?? (totalAmount - amountPaid)) || 0;

  const dueDateStr = invoice.dueDate
    ? (invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : String(invoice.dueDate))
    : new Date().toISOString();

  const invoiceDateStr = invoice.invoiceDate
    ? (invoice.invoiceDate instanceof Date ? invoice.invoiceDate.toISOString() : String(invoice.invoiceDate))
    : invoice.createdAt
    ? (invoice.createdAt instanceof Date ? invoice.createdAt.toISOString() : String(invoice.createdAt))
    : new Date().toISOString();

  const paymentStatusSummary = resolvePaymentStatusSummary(
    invoice.status,
    invoice.dueDate || invoice.createdAt,
    balanceDue
  );

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    title: invoice.title || `Invoice ${invoice.invoiceNumber}`,
    status: invoice.status,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    amountPaid,
    balanceDue,
    currency: invoice.currency || 'USD',
    issueDate: invoiceDateStr,
    invoiceDate: invoiceDateStr,
    dueDate: dueDateStr,
    paidAt: invoice.paidAt
      ? (invoice.paidAt instanceof Date ? invoice.paidAt.toISOString() : String(invoice.paidAt))
      : null,
    paymentStatusSummary,
    notes: invoice.notes || null,
    termsConditions: invoice.termsConditions || null,
    itemsCount: items.length,
    items,
    payments,
    company,
    customer,
    project: invoice.project
      ? {
          id: invoice.project.id,
          name: invoice.project.name,
          projectCode: invoice.project.projectCode,
        }
      : null,
  };
}

/**
 * Sanitizes a single Quotation database record for client consumption.
 */
export function sanitizeClientQuotation(quotation: any): ClientQuotation {
  if (!quotation) {
    throw new Error('Quotation not found');
  }

  const company = extractClientCompanyInfo(quotation.company);
  const customer = extractClientCustomerInfo(quotation.customer);
  const items = sanitizeFinancialItems(quotation.items || []);

  const subtotal = Number(quotation.subtotal) || 0;
  const discountAmount = Number(quotation.discountAmount) || 0;
  const taxAmount = Number(quotation.taxAmount) || 0;
  const totalAmount = Number(quotation.grandTotal ?? quotation.totalAmount) || 0;

  const quoteDateStr = quotation.quoteDate
    ? (quotation.quoteDate instanceof Date ? quotation.quoteDate.toISOString() : String(quotation.quoteDate))
    : quotation.createdAt
    ? (quotation.createdAt instanceof Date ? quotation.createdAt.toISOString() : String(quotation.createdAt))
    : new Date().toISOString();

  const expiryDateStr = quotation.expiryDate
    ? (quotation.expiryDate instanceof Date ? quotation.expiryDate.toISOString() : String(quotation.expiryDate))
    : quotation.validUntil
    ? (quotation.validUntil instanceof Date ? quotation.validUntil.toISOString() : String(quotation.validUntil))
    : new Date().toISOString();

  return {
    id: quotation.id,
    quotationNumber: quotation.quoteNumber || quotation.quotationNumber,
    title: quotation.title || `Quotation ${quotation.quoteNumber || quotation.quotationNumber}`,
    status: quotation.status,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    currency: quotation.currency || 'USD',
    quoteDate: quoteDateStr,
    issueDate: quoteDateStr,
    validUntil: expiryDateStr,
    expiryDate: expiryDateStr,
    notes: quotation.notes || null,
    termsConditions: quotation.termsConditions || null,
    itemsCount: items.length,
    items,
    company,
    customer,
    project: quotation.project
      ? {
          id: quotation.project.id,
          name: quotation.project.name,
          projectCode: quotation.project.projectCode,
        }
      : null,
  };
}

/**
 * Computes aggregate summary KPIs for the invoices list.
 */
export function calculateInvoiceKpis(invoices: ClientInvoice[]) {
  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalOutstanding = invoices
    .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + (inv.balanceDue ?? (inv.totalAmount - inv.amountPaid)), 0);

  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;
  const overdueCount = invoices.filter((inv) => inv.status === 'OVERDUE' || (inv.paymentStatusSummary && inv.paymentStatusSummary.includes('Overdue'))).length;
  const pendingCount = invoices.filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.status !== 'OVERDUE').length;

  return {
    totalBilled,
    totalPaid,
    totalOutstanding,
    paidCount,
    overdueCount,
    pendingCount,
    totalInvoices: invoices.length,
  };
}

/**
 * Computes aggregate summary KPIs for the quotations list.
 */
export function calculateQuotationKpis(quotations: ClientQuotation[]) {
  const totalQuotes = quotations.length;
  const acceptedCount = quotations.filter((q) => q.status === 'ACCEPTED').length;
  const pendingCount = quotations.filter((q) => q.status === 'SENT' || q.status === 'DRAFT').length;
  const rejectedCount = quotations.filter((q) => q.status === 'REJECTED').length;
  const expiredCount = quotations.filter((q) => q.status === 'EXPIRED').length;
  const totalPipelineValue = quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

  return {
    totalQuotes,
    acceptedCount,
    pendingCount,
    rejectedCount,
    expiredCount,
    totalPipelineValue,
  };
}
