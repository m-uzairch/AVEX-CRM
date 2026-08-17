/* eslint-disable @typescript-eslint/no-explicit-any */

export type InvoiceLayoutStyle = 'CLASSIC' | 'MODERN' | 'MINIMAL' | 'PROFESSIONAL';

export interface InvoiceTemplate {
  id: string;
  companyId: string;
  name: string;
  layoutStyle: InvoiceLayoutStyle;
  isDefault: boolean;
  isBuiltIn: boolean;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: 'COMPACT' | 'NORMAL' | 'LARGE';
  logoPosition: 'LEFT' | 'CENTER' | 'RIGHT';
  headerAlignment: 'LEFT' | 'CENTER' | 'RIGHT';
  showCompanyAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showTaxNumber: boolean;
  visibleColumns: string[];
  visibleSummaryFields: string[];
  thankYouMessage?: string | null;
  footerText?: string | null;
  defaultTerms?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyBranding {
  id?: string;
  companyId: string;
  companyName?: string | null;
  logoUrl?: string | null;
  taxNumber?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}

export interface InvoiceTemplateFormValues {
  name: string;
  layoutStyle: InvoiceLayoutStyle;
  isDefault?: boolean;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: 'COMPACT' | 'NORMAL' | 'LARGE';
  logoPosition: 'LEFT' | 'CENTER' | 'RIGHT';
  headerAlignment: 'LEFT' | 'CENTER' | 'RIGHT';
  showCompanyAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showTaxNumber: boolean;
  visibleColumns: string[];
  visibleSummaryFields: string[];
  thankYouMessage?: string;
  footerText?: string;
  defaultTerms?: string;
}
