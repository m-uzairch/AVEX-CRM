/* eslint-disable @typescript-eslint/no-explicit-any */

export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED';

export type EstimateType = 'FIXED_PRICE' | 'HOURLY' | 'MONTHLY' | 'CUSTOM';

export interface QuotationItemInput {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  taxRate?: number;
  lineTotal?: number;
  sortOrder?: number;
}

export interface QuotationFormValues {
  customerId: string;
  leadId?: string;
  salesRepId?: string;
  estimateType: EstimateType;
  quoteDate: string;
  expiryDate: string;
  currency: string;
  status: QuotationStatus;
  notes?: string;
  termsConditions?: string;
  changeNotes?: string;
  items: QuotationItemInput[];
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  taxRate: number;
  lineTotal: number;
  sortOrder: number;
  createdAt: string;
}

export interface QuotationVersion {
  id: string;
  quotationId: string;
  versionNumber: number;
  snapshotData: any;
  changeNotes?: string | null;
  createdById?: string | null;
  createdByName?: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  companyId: string;
  quoteNumber: string;
  customerId: string;
  leadId?: string | null;
  salesRepId?: string | null;
  estimateType: EstimateType;
  quoteDate: string;
  expiryDate: string;
  status: QuotationStatus;
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  notes?: string | null;
  termsConditions?: string | null;
  version: number;
  sentAt?: string | null;
  viewedAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  convertedAt?: string | null;
  convertedProjectId?: string | null;
  convertedInvoiceId?: string | null;
  deletedAt?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;

  customer?: {
    id: string;
    name: string;
    companyName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
  };
  lead?: {
    id: string;
    title: string;
    contactName: string;
    companyName?: string;
    email?: string;
  } | null;
  salesRep?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  items?: QuotationItem[];
  versions?: QuotationVersion[];
}

export interface QuotationFilterState {
  search?: string;
  status?: string;
  estimateType?: string;
  customerId?: string;
  leadId?: string;
}

export interface QuotationKPISummary {
  totalQuotesCount: number;
  totalQuotedValue: number;
  acceptedValue: number;
  pendingValue: number;
  draftCount: number;
  sentCount: number;
  acceptedCount: number;
  rejectedCount: number;
  expiredCount: number;
  convertedCount: number;
}
