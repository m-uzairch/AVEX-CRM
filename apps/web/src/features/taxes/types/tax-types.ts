/* eslint-disable @typescript-eslint/no-explicit-any */

export type TaxType = 'INCLUSIVE' | 'EXCLUSIVE';
export type TaxStatus = 'ACTIVE' | 'INACTIVE';

export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type DiscountApplicableTo = 'INVOICE' | 'QUOTATION' | 'LINE_ITEM' | 'ALL';
export type DiscountRuleStatus = 'ACTIVE' | 'EXPIRED' | 'INACTIVE';

export interface TaxRate {
  id: string;
  companyId: string;
  name: string;
  code?: string | null;
  percentage: number;
  type: TaxType;
  description?: string | null;
  status: TaxStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRateInput {
  name: string;
  code?: string;
  percentage: number;
  type?: TaxType;
  description?: string;
  status?: TaxStatus;
}

export interface TaxTemplateItem {
  id: string;
  templateId: string;
  taxRateId: string;
  taxRate?: TaxRate;
  createdAt: string;
}

export interface TaxTemplate {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  calculationMethod: TaxType;
  createdAt: string;
  updatedAt: string;
  items?: TaxTemplateItem[];
  taxes?: TaxRate[];
}

export interface TaxTemplateInput {
  name: string;
  description?: string;
  isDefault?: boolean;
  calculationMethod?: TaxType;
  taxRateIds: string[];
}

export interface Discount {
  id: string;
  companyId: string;
  name: string;
  code?: string | null;
  type: DiscountType;
  value: number;
  applicableTo: DiscountApplicableTo;
  description?: string | null;
  status: TaxStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountInput {
  name: string;
  code?: string;
  type: DiscountType;
  value: number;
  applicableTo?: DiscountApplicableTo;
  description?: string;
  status?: TaxStatus;
}

export interface DiscountRule {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  type: DiscountType;
  value: number;
  startDate?: string | null;
  endDate?: string | null;
  status: DiscountRuleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountRuleInput {
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  startDate?: string;
  endDate?: string;
  status?: DiscountRuleStatus;
}

export interface LineItemForCalculation {
  id?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number; // % item discount
  discountAmount?: number; // fixed item discount
  taxRate?: number; // % item tax rate
  taxRates?: number[]; // list of tax percentages applied
}

export interface TaxCalculationParams {
  items: LineItemForCalculation[];
  calculationMethod?: TaxType; // INCLUSIVE or EXCLUSIVE
  orderDiscountType?: DiscountType;
  orderDiscountValue?: number;
  taxes?: { name: string; rate: number; type?: TaxType }[];
}

export interface TaxBreakdownItem {
  taxName: string;
  rate: number;
  type: TaxType;
  taxAmount: number;
}

export interface TaxCalculationResult {
  rawSubtotal: number;
  itemDiscountsTotal: number;
  subtotalAfterItemDiscounts: number;
  orderDiscountTotal: number;
  taxableAmount: number;
  totalTaxAmount: number;
  taxBreakdown: TaxBreakdownItem[];
  grandTotal: number;
}

export interface TaxSummary {
  totalTaxCollected: number;
  activeTaxesCount: number;
  templatesCount: number;
  taxByType: {
    type: TaxType;
    count: number;
    totalAmount: number;
  }[];
  taxByPeriod: {
    period: string; // e.g. "2026-08" or "Q3 2026"
    amount: number;
  }[];
  recentAppliedTaxes: {
    invoiceNumber: string;
    customerName: string;
    date: string;
    taxAmount: number;
    grandTotal: number;
  }[];
}

export interface DiscountSummary {
  totalDiscountsGiven: number;
  activeDiscountsCount: number;
  activeRulesCount: number;
  discountsByType: {
    type: DiscountType;
    count: number;
    totalAmount: number;
  }[];
  discountsByCustomer: {
    customerId: string;
    customerName: string;
    discountAmount: number;
  }[];
  discountsByProject: {
    projectId: string;
    projectName: string;
    discountAmount: number;
  }[];
}

export interface TaxFilterState {
  search?: string;
  status?: TaxStatus | 'ALL';
  type?: TaxType | 'ALL';
}

export interface DiscountFilterState {
  search?: string;
  status?: TaxStatus | 'ALL';
  type?: DiscountType | 'ALL';
  applicableTo?: DiscountApplicableTo | 'ALL';
}
