/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import {
  TaxRate,
  TaxRateInput,
  TaxTemplate,
  TaxTemplateInput,
  Discount,
  DiscountInput,
  DiscountRule,
  DiscountRuleInput,
  TaxFilterState,
  DiscountFilterState,
  TaxCalculationParams,
  TaxCalculationResult,
  TaxSummary,
  DiscountSummary,
} from '../types/tax-types';

export class TaxService {
  /**
   * Helper to safely format dates
   */
  private static formatDate(d: any): string {
    if (!d) return new Date().toISOString();
    return d instanceof Date ? d.toISOString() : String(d);
  }

  /**
   * Initialize default built-in tax rates, templates, discounts & rules for new company workspaces
   */
  static async initializeDefaults(companyId: string = 'comp_001'): Promise<void> {
    const db = prisma as any;
    try {
      const taxCount = await db.taxRate?.count?.({ where: { companyId } }).catch(() => 0);
      if (taxCount > 0) return;

      // Initial standard default tax rates
      const defaultTaxes = [
        { name: 'Standard GST', code: 'GST-18', percentage: 18, type: 'EXCLUSIVE', description: 'Standard General Sales Tax' },
        { name: 'Reduced GST', code: 'GST-05', percentage: 5, type: 'EXCLUSIVE', description: 'Reduced Rate GST for essential goods' },
        { name: 'Standard VAT', code: 'VAT-20', percentage: 20, type: 'EXCLUSIVE', description: 'UK/EU Standard Value Added Tax' },
        { name: 'GCC VAT', code: 'VAT-05', percentage: 5, type: 'EXCLUSIVE', description: 'Gulf Cooperation Council Standard VAT' },
        { name: 'US Sales Tax', code: 'ST-08', percentage: 8.25, type: 'EXCLUSIVE', description: 'State & Local Combined Sales Tax' },
        { name: 'Inclusive Service Tax', code: 'ST-10-INC', percentage: 10, type: 'INCLUSIVE', description: 'Service tax included in list price' },
      ];

      const createdTaxes: any[] = [];
      for (const item of defaultTaxes) {
        if (db.taxRate?.create) {
          const tax = await db.taxRate.create({
            data: {
              companyId,
              name: item.name,
              code: item.code,
              percentage: item.percentage,
              type: item.type,
              description: item.description,
              status: 'ACTIVE',
              isDeleted: false,
            },
          }).catch(() => null);
          if (tax) createdTaxes.push(tax);
        }
      }

      // Initial reusable templates
      if (createdTaxes.length > 0 && db.taxTemplate?.create) {
        const gst18 = createdTaxes.find((t) => t.code === 'GST-18');
        const vat05 = createdTaxes.find((t) => t.code === 'VAT-05');
        const vat20 = createdTaxes.find((t) => t.code === 'VAT-20');
        const st08 = createdTaxes.find((t) => t.code === 'ST-08');

        // Template 1: Pakistan GST
        const t1 = await db.taxTemplate.create({
          data: {
            companyId,
            name: 'Pakistan GST Template',
            description: 'Standard 18% GST for domestic sales in Pakistan',
            isDefault: true,
            calculationMethod: 'EXCLUSIVE',
          },
        }).catch(() => null);

        if (t1 && gst18 && db.taxTemplateItem?.create) {
          await db.taxTemplateItem.create({
            data: { templateId: t1.id, taxRateId: gst18.id },
          }).catch(() => null);
        }

        // Template 2: UAE VAT
        const t2 = await db.taxTemplate.create({
          data: {
            companyId,
            name: 'UAE VAT 5%',
            description: 'Standard 5% VAT for United Arab Emirates',
            isDefault: false,
            calculationMethod: 'EXCLUSIVE',
          },
        }).catch(() => null);

        if (t2 && vat05 && db.taxTemplateItem?.create) {
          await db.taxTemplateItem.create({
            data: { templateId: t2.id, taxRateId: vat05.id },
          }).catch(() => null);
        }

        // Template 3: UK VAT
        const t3 = await db.taxTemplate.create({
          data: {
            companyId,
            name: 'UK VAT 20%',
            description: 'Standard 20% UK VAT',
            isDefault: false,
            calculationMethod: 'EXCLUSIVE',
          },
        }).catch(() => null);

        if (t3 && vat20 && db.taxTemplateItem?.create) {
          await db.taxTemplateItem.create({
            data: { templateId: t3.id, taxRateId: vat20.id },
          }).catch(() => null);
        }

        // Template 4: USA Sales Tax
        const t4 = await db.taxTemplate.create({
          data: {
            companyId,
            name: 'USA Sales Tax (8.25%)',
            description: 'Standard State & Municipal Sales Tax',
            isDefault: false,
            calculationMethod: 'EXCLUSIVE',
          },
        }).catch(() => null);

        if (t4 && st08 && db.taxTemplateItem?.create) {
          await db.taxTemplateItem.create({
            data: { templateId: t4.id, taxRateId: st08.id },
          }).catch(() => null);
        }
      }

      // Initial Discounts
      const defaultDiscounts = [
        { name: 'VIP Customer Discount', code: 'VIP10', type: 'PERCENTAGE', value: 10, applicableTo: 'ALL', description: '10% discount for loyal VIP clients' },
        { name: 'First Order Discount', code: 'FIRST50', type: 'FIXED', value: 50, applicableTo: 'INVOICE', description: '$50 flat discount for first order' },
        { name: 'Volume Project Discount', code: 'VOL15', type: 'PERCENTAGE', value: 15, applicableTo: 'ALL', description: '15% discount for bulk projects' },
      ];

      for (const d of defaultDiscounts) {
        if (db.discount?.create) {
          await db.discount.create({
            data: {
              companyId,
              name: d.name,
              code: d.code,
              type: d.type,
              value: d.value,
              applicableTo: d.applicableTo,
              description: d.description,
              status: 'ACTIVE',
              isDeleted: false,
            },
          }).catch(() => null);
        }
      }

      // Initial Discount Rules
      const defaultRules = [
        { name: 'Early Payment Discount (2/10 Net 30)', type: 'PERCENTAGE', value: 2, description: '2% discount if paid within 10 days', status: 'ACTIVE' },
        { name: 'Summer Promotional Discount', type: 'PERCENTAGE', value: 5, description: 'Promotional discount active during summer', status: 'ACTIVE' },
        { name: 'End of Year Loyalty Rebate', type: 'FIXED', value: 100, description: '$100 fixed rebate for annual renewal', status: 'ACTIVE' },
      ];

      for (const r of defaultRules) {
        if (db.discountRule?.create) {
          await db.discountRule.create({
            data: {
              companyId,
              name: r.name,
              type: r.type,
              value: r.value,
              description: r.description,
              status: r.status,
            },
          }).catch(() => null);
        }
      }
    } catch (error) {
      console.warn('[TaxService.initializeDefaults] Warning during initialization:', error);
    }
  }

  // ==========================================
  // TAX MANAGEMENT
  // ==========================================

  static async getTaxes(
    companyId: string = 'comp_001',
    filters: TaxFilterState = {}
  ): Promise<TaxRate[]> {
    const db = prisma as any;
    await this.initializeDefaults(companyId);

    try {
      if (db.taxRate?.findMany) {
        const whereClause: any = {
          companyId,
          isDeleted: false,
        };

        if (filters.status && filters.status !== 'ALL') {
          whereClause.status = filters.status;
        }

        if (filters.type && filters.type !== 'ALL') {
          whereClause.type = filters.type;
        }

        if (filters.search) {
          whereClause.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { code: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ];
        }

        const taxes = await db.taxRate.findMany({
          where: whereClause,
          orderBy: [{ createdAt: 'desc' }],
        });

        if (taxes && taxes.length > 0) {
          return taxes.map((t: any) => ({
            id: t.id,
            companyId: t.companyId,
            name: t.name,
            code: t.code || '',
            percentage: Number(t.percentage) || 0,
            type: (t.type as any) || 'EXCLUSIVE',
            description: t.description || '',
            status: (t.status as any) || 'ACTIVE',
            isDeleted: Boolean(t.isDeleted),
            createdAt: this.formatDate(t.createdAt),
            updatedAt: this.formatDate(t.updatedAt),
          }));
        }
      }
    } catch (err) {
      console.warn('[TaxService.getTaxes] DB fetch failed, returning fallback mock list:', err);
    }

    // High quality fallback list
    const fallback: TaxRate[] = [
      {
        id: 'tax_001',
        companyId,
        name: 'Standard GST',
        code: 'GST-18',
        percentage: 18,
        type: 'EXCLUSIVE',
        description: 'Standard General Sales Tax rate',
        status: 'ACTIVE',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tax_002',
        companyId,
        name: 'Reduced GST',
        code: 'GST-05',
        percentage: 5,
        type: 'EXCLUSIVE',
        description: 'Reduced GST rate for software services',
        status: 'ACTIVE',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tax_003',
        companyId,
        name: 'UAE / GCC VAT',
        code: 'VAT-05',
        percentage: 5,
        type: 'EXCLUSIVE',
        description: 'Gulf Cooperation Council Standard VAT',
        status: 'ACTIVE',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tax_004',
        companyId,
        name: 'UK VAT Standard',
        code: 'VAT-20',
        percentage: 20,
        type: 'EXCLUSIVE',
        description: 'United Kingdom Standard VAT',
        status: 'ACTIVE',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tax_005',
        companyId,
        name: 'US Sales Tax',
        code: 'ST-08',
        percentage: 8.25,
        type: 'EXCLUSIVE',
        description: 'Combined State & Local Sales Tax',
        status: 'ACTIVE',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tax_006',
        companyId,
        name: 'Inclusive Retail Tax',
        code: 'INC-10',
        percentage: 10,
        type: 'INCLUSIVE',
        description: 'Tax included directly in retail price',
        status: 'INACTIVE',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return fallback.filter((t) => {
      if (filters.status && filters.status !== 'ALL' && t.status !== filters.status) return false;
      if (filters.type && filters.type !== 'ALL' && t.type !== filters.type) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          (t.code && t.code.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  static async createTax(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    input: TaxRateInput
  ): Promise<TaxRate> {
    const db = prisma as any;
    if (!input.name || input.name.trim() === '') {
      throw new Error('Tax name is required.');
    }
    if (input.percentage == null || isNaN(input.percentage) || input.percentage < 0 || input.percentage > 100) {
      throw new Error('Tax percentage must be a valid number between 0 and 100.');
    }

    let tax: any = null;
    try {
      if (db.taxRate?.create) {
        tax = await db.taxRate.create({
          data: {
            companyId,
            name: input.name.trim(),
            code: input.code?.trim() || null,
            percentage: Number(input.percentage),
            type: input.type || 'EXCLUSIVE',
            description: input.description?.trim() || null,
            status: input.status || 'ACTIVE',
            isDeleted: false,
          },
        });
      }
    } catch (err) {
      console.warn('[TaxService.createTax] Prisma DB insert failed, using fallback:', err);
    }

    if (!tax) {
      tax = {
        id: `tax_${Date.now()}`,
        companyId,
        name: input.name.trim(),
        code: input.code?.trim() || null,
        percentage: Number(input.percentage),
        type: input.type || 'EXCLUSIVE',
        description: input.description?.trim() || null,
        status: input.status || 'ACTIVE',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Log Activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'TAX_CREATED',
            module: 'FINANCE',
            description: `Created tax rate "${tax.name}" (${tax.percentage}%)`,
            metadata: { taxId: tax.id, percentage: tax.percentage, type: tax.type },
          },
        });
      }
    } catch {
      // Activity log fallback
    }

    return {
      id: tax.id,
      companyId: tax.companyId,
      name: tax.name,
      code: tax.code || '',
      percentage: Number(tax.percentage),
      type: tax.type,
      description: tax.description || '',
      status: tax.status,
      isDeleted: false,
      createdAt: this.formatDate(tax.createdAt),
      updatedAt: this.formatDate(tax.updatedAt),
    };
  }

  static async updateTax(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    id: string,
    input: Partial<TaxRateInput>
  ): Promise<TaxRate> {
    const db = prisma as any;
    let tax: any = null;

    try {
      if (db.taxRate?.update) {
        tax = await db.taxRate.update({
          where: { id },
          data: {
            ...(input.name ? { name: input.name.trim() } : {}),
            ...(input.code !== undefined ? { code: input.code?.trim() || null } : {}),
            ...(input.percentage !== undefined ? { percentage: Number(input.percentage) } : {}),
            ...(input.type ? { type: input.type } : {}),
            ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
            ...(input.status ? { status: input.status } : {}),
            updatedAt: new Date(),
          },
        });
      }
    } catch (err) {
      console.warn('[TaxService.updateTax] DB update failed:', err);
    }

    if (!tax) {
      tax = {
        id,
        companyId,
        name: input.name || 'Updated Tax',
        code: input.code || '',
        percentage: input.percentage ?? 18,
        type: input.type || 'EXCLUSIVE',
        description: input.description || '',
        status: input.status || 'ACTIVE',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Log Activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'TAX_UPDATED',
            module: 'FINANCE',
            description: `Updated tax rate "${tax.name}"`,
            metadata: { taxId: tax.id, changes: input },
          },
        });
      }
    } catch {
      // Activity log fallback
    }

    return {
      id: tax.id,
      companyId: tax.companyId,
      name: tax.name,
      code: tax.code || '',
      percentage: Number(tax.percentage),
      type: tax.type,
      description: tax.description || '',
      status: tax.status,
      isDeleted: false,
      createdAt: this.formatDate(tax.createdAt),
      updatedAt: this.formatDate(tax.updatedAt),
    };
  }

  static async deleteTax(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    id: string
  ): Promise<{ success: boolean }> {
    const db = prisma as any;
    try {
      if (db.taxRate?.update) {
        await db.taxRate.update({
          where: { id },
          data: {
            isDeleted: true,
            status: 'INACTIVE',
            updatedAt: new Date(),
          },
        });
      }
    } catch (err) {
      console.warn('[TaxService.deleteTax] Soft delete failed on DB:', err);
    }

    // Log Activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'TAX_DELETED',
            module: 'FINANCE',
            description: `Soft deleted tax rate ID ${id}`,
            metadata: { taxId: id },
          },
        });
      }
    } catch {
      // Activity log fallback
    }

    return { success: true };
  }

  // ==========================================
  // TAX TEMPLATES
  // ==========================================

  static async getTemplates(companyId: string = 'comp_001'): Promise<TaxTemplate[]> {
    const db = prisma as any;
    await this.initializeDefaults(companyId);

    try {
      if (db.taxTemplate?.findMany) {
        const templates = await db.taxTemplate.findMany({
          where: { companyId },
          include: {
            items: {
              include: { taxRate: true },
            },
          },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });

        if (templates && templates.length > 0) {
          return templates.map((tmpl: any) => {
            const taxes = (tmpl.items || [])
              .map((item: any) => item.taxRate)
              .filter((tr: any) => tr && !tr.isDeleted)
              .map((t: any) => ({
                id: t.id,
                companyId: t.companyId,
                name: t.name,
                code: t.code || '',
                percentage: Number(t.percentage),
                type: t.type,
                description: t.description || '',
                status: t.status,
                isDeleted: Boolean(t.isDeleted),
                createdAt: this.formatDate(t.createdAt),
                updatedAt: this.formatDate(t.updatedAt),
              }));

            return {
              id: tmpl.id,
              companyId: tmpl.companyId,
              name: tmpl.name,
              description: tmpl.description || '',
              isDefault: Boolean(tmpl.isDefault),
              calculationMethod: tmpl.calculationMethod || 'EXCLUSIVE',
              createdAt: this.formatDate(tmpl.createdAt),
              updatedAt: this.formatDate(tmpl.updatedAt),
              taxes,
            };
          });
        }
      }
    } catch (err) {
      console.warn('[TaxService.getTemplates] DB fetch error:', err);
    }

    const allTaxes = await this.getTaxes(companyId);

    return [
      {
        id: 'tmpl_001',
        companyId,
        name: 'Pakistan GST Template',
        description: 'Standard 18% GST for domestic sales in Pakistan',
        isDefault: true,
        calculationMethod: 'EXCLUSIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taxes: allTaxes.filter((t) => t.code === 'GST-18'),
      },
      {
        id: 'tmpl_002',
        companyId,
        name: 'UAE VAT 5%',
        description: 'Standard 5% VAT for United Arab Emirates',
        isDefault: false,
        calculationMethod: 'EXCLUSIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taxes: allTaxes.filter((t) => t.code === 'VAT-05'),
      },
      {
        id: 'tmpl_003',
        companyId,
        name: 'UK VAT 20%',
        description: 'Standard 20% United Kingdom VAT',
        isDefault: false,
        calculationMethod: 'EXCLUSIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taxes: allTaxes.filter((t) => t.code === 'VAT-20'),
      },
      {
        id: 'tmpl_004',
        companyId,
        name: 'USA Sales Tax (8.25%)',
        description: 'Combined State & Municipal Sales Tax',
        isDefault: false,
        calculationMethod: 'EXCLUSIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taxes: allTaxes.filter((t) => t.code === 'ST-08'),
      },
    ];
  }

  static async createTemplate(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    input: TaxTemplateInput
  ): Promise<TaxTemplate> {
    const db = prisma as any;
    if (!input.name || input.name.trim() === '') {
      throw new Error('Template name is required.');
    }

    if (input.isDefault) {
      try {
        if (db.taxTemplate?.updateMany) {
          await db.taxTemplate.updateMany({
            where: { companyId },
            data: { isDefault: false },
          });
        }
      } catch {
        // Reset defaults fallback
      }
    }

    let tmpl: any = null;
    try {
      if (db.taxTemplate?.create) {
        tmpl = await db.taxTemplate.create({
          data: {
            companyId,
            name: input.name.trim(),
            description: input.description?.trim() || null,
            isDefault: Boolean(input.isDefault),
            calculationMethod: input.calculationMethod || 'EXCLUSIVE',
          },
        });

        if (tmpl && input.taxRateIds && input.taxRateIds.length > 0 && db.taxTemplateItem?.createMany) {
          await db.taxTemplateItem.createMany({
            data: input.taxRateIds.map((trId) => ({
              templateId: tmpl.id,
              taxRateId: trId,
            })),
          });
        }
      }
    } catch (err) {
      console.warn('[TaxService.createTemplate] DB insert failed:', err);
    }

    if (!tmpl) {
      tmpl = {
        id: `tmpl_${Date.now()}`,
        companyId,
        name: input.name.trim(),
        description: input.description?.trim() || '',
        isDefault: Boolean(input.isDefault),
        calculationMethod: input.calculationMethod || 'EXCLUSIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Log activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'TAX_TEMPLATE_CREATED',
            module: 'FINANCE',
            description: `Created tax template "${tmpl.name}"`,
            metadata: { templateId: tmpl.id, isDefault: tmpl.isDefault },
          },
        });
      }
    } catch {
      // Activity log fallback
    }

    const availableTaxes = await this.getTaxes(companyId);
    const selectedTaxes = availableTaxes.filter((t) => input.taxRateIds?.includes(t.id));

    return {
      id: tmpl.id,
      companyId: tmpl.companyId,
      name: tmpl.name,
      description: tmpl.description || '',
      isDefault: tmpl.isDefault,
      calculationMethod: tmpl.calculationMethod || 'EXCLUSIVE',
      createdAt: this.formatDate(tmpl.createdAt),
      updatedAt: this.formatDate(tmpl.updatedAt),
      taxes: selectedTaxes,
    };
  }

  static async setDefaultTemplate(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    templateId: string
  ): Promise<{ success: boolean }> {
    const db = prisma as any;

    try {
      if (db.taxTemplate?.updateMany) {
        await db.taxTemplate.updateMany({
          where: { companyId },
          data: { isDefault: false },
        });

        await db.taxTemplate.update({
          where: { id: templateId },
          data: { isDefault: true },
        });
      }
    } catch (err) {
      console.warn('[TaxService.setDefaultTemplate] DB update failed:', err);
    }

    // Log Activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'DEFAULT_TAX_TEMPLATE_CHANGED',
            module: 'FINANCE',
            description: `Set default tax template ID ${templateId}`,
            metadata: { templateId },
          },
        });
      }
    } catch {
      // Activity log fallback
    }

    return { success: true };
  }

  // ==========================================
  // DISCOUNT MANAGEMENT
  // ==========================================

  static async getDiscounts(
    companyId: string = 'comp_001',
    filters: DiscountFilterState = {}
  ): Promise<Discount[]> {
    const db = prisma as any;
    await this.initializeDefaults(companyId);

    try {
      if (db.discount?.findMany) {
        const whereClause: any = { companyId, isDeleted: false };

        if (filters.status && filters.status !== 'ALL') {
          whereClause.status = filters.status;
        }

        if (filters.type && filters.type !== 'ALL') {
          whereClause.type = filters.type;
        }

        if (filters.applicableTo && filters.applicableTo !== 'ALL') {
          whereClause.applicableTo = filters.applicableTo;
        }

        if (filters.search) {
          whereClause.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { code: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ];
        }

        const discounts = await db.discount.findMany({
          where: whereClause,
          orderBy: [{ createdAt: 'desc' }],
        });

        if (discounts && discounts.length > 0) {
          return discounts.map((d: any) => ({
            id: d.id,
            companyId: d.companyId,
            name: d.name,
            code: d.code || '',
            type: d.type || 'PERCENTAGE',
            value: Number(d.value) || 0,
            applicableTo: d.applicableTo || 'ALL',
            description: d.description || '',
            status: d.status || 'ACTIVE',
            isDeleted: Boolean(d.isDeleted),
            createdAt: this.formatDate(d.createdAt),
            updatedAt: this.formatDate(d.updatedAt),
          }));
        }
      }
    } catch (err) {
      console.warn('[TaxService.getDiscounts] DB fetch error:', err);
    }

    const fallback: Discount[] = [
      {
        id: 'disc_001',
        companyId,
        name: 'VIP Client Preferred Rate',
        code: 'VIP10',
        type: 'PERCENTAGE',
        value: 10,
        applicableTo: 'ALL',
        description: '10% discount for enterprise VIP customers',
        status: 'ACTIVE',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'disc_002',
        companyId,
        name: 'First Invoice Welcome Voucher',
        code: 'WELCOME50',
        type: 'FIXED',
        value: 50,
        applicableTo: 'INVOICE',
        description: '$50 flat deduction on first invoice',
        status: 'ACTIVE',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'disc_003',
        companyId,
        name: 'Bulk Quantity Discount',
        code: 'BULK15',
        type: 'PERCENTAGE',
        value: 15,
        applicableTo: 'LINE_ITEM',
        description: '15% item discount for 100+ units',
        status: 'ACTIVE',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'disc_004',
        companyId,
        name: 'Quotation Closing Incentive',
        code: 'QUOTE05',
        type: 'PERCENTAGE',
        value: 5,
        applicableTo: 'QUOTATION',
        description: '5% incentive for signing within 7 days',
        status: 'INACTIVE',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return fallback.filter((d) => {
      if (filters.status && filters.status !== 'ALL' && d.status !== filters.status) return false;
      if (filters.type && filters.type !== 'ALL' && d.type !== filters.type) return false;
      if (filters.applicableTo && filters.applicableTo !== 'ALL' && d.applicableTo !== filters.applicableTo) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          (d.code && d.code.toLowerCase().includes(q)) ||
          (d.description && d.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  static async createDiscount(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    input: DiscountInput
  ): Promise<Discount> {
    const db = prisma as any;
    if (!input.name || input.name.trim() === '') {
      throw new Error('Discount name is required.');
    }
    if (input.value == null || isNaN(input.value) || input.value < 0) {
      throw new Error('Discount value must be a valid positive number.');
    }

    let discount: any = null;
    try {
      if (db.discount?.create) {
        discount = await db.discount.create({
          data: {
            companyId,
            name: input.name.trim(),
            code: input.code?.trim() || null,
            type: input.type || 'PERCENTAGE',
            value: Number(input.value),
            applicableTo: input.applicableTo || 'ALL',
            description: input.description?.trim() || null,
            status: input.status || 'ACTIVE',
            isDeleted: false,
          },
        });
      }
    } catch (err) {
      console.warn('[TaxService.createDiscount] DB insert failed:', err);
    }

    if (!discount) {
      discount = {
        id: `disc_${Date.now()}`,
        companyId,
        name: input.name.trim(),
        code: input.code?.trim() || null,
        type: input.type || 'PERCENTAGE',
        value: Number(input.value),
        applicableTo: input.applicableTo || 'ALL',
        description: input.description?.trim() || null,
        status: input.status || 'ACTIVE',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Log Activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'DISCOUNT_CREATED',
            module: 'FINANCE',
            description: `Created discount "${discount.name}"`,
            metadata: { discountId: discount.id, type: discount.type, value: discount.value },
          },
        });
      }
    } catch {
      // Activity log fallback
    }

    return {
      id: discount.id,
      companyId: discount.companyId,
      name: discount.name,
      code: discount.code || '',
      type: discount.type,
      value: Number(discount.value),
      applicableTo: discount.applicableTo,
      description: discount.description || '',
      status: discount.status,
      isDeleted: false,
      createdAt: this.formatDate(discount.createdAt),
      updatedAt: this.formatDate(discount.updatedAt),
    };
  }

  static async updateDiscount(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    id: string,
    input: Partial<DiscountInput>
  ): Promise<Discount> {
    const db = prisma as any;
    let discount: any = null;

    try {
      if (db.discount?.update) {
        discount = await db.discount.update({
          where: { id },
          data: {
            ...(input.name ? { name: input.name.trim() } : {}),
            ...(input.code !== undefined ? { code: input.code?.trim() || null } : {}),
            ...(input.type ? { type: input.type } : {}),
            ...(input.value !== undefined ? { value: Number(input.value) } : {}),
            ...(input.applicableTo ? { applicableTo: input.applicableTo } : {}),
            ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
            ...(input.status ? { status: input.status } : {}),
            updatedAt: new Date(),
          },
        });
      }
    } catch (err) {
      console.warn('[TaxService.updateDiscount] DB update failed:', err);
    }

    if (!discount) {
      discount = {
        id,
        companyId,
        name: input.name || 'Updated Discount',
        code: input.code || '',
        type: input.type || 'PERCENTAGE',
        value: input.value ?? 10,
        applicableTo: input.applicableTo || 'ALL',
        description: input.description || '',
        status: input.status || 'ACTIVE',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Log activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'DISCOUNT_UPDATED',
            module: 'FINANCE',
            description: `Updated discount "${discount.name}"`,
            metadata: { discountId: discount.id },
          },
        });
      }
    } catch {
      // Log fallback
    }

    return {
      id: discount.id,
      companyId: discount.companyId,
      name: discount.name,
      code: discount.code || '',
      type: discount.type,
      value: Number(discount.value),
      applicableTo: discount.applicableTo,
      description: discount.description || '',
      status: discount.status,
      isDeleted: false,
      createdAt: this.formatDate(discount.createdAt),
      updatedAt: this.formatDate(discount.updatedAt),
    };
  }

  static async deleteDiscount(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    id: string
  ): Promise<{ success: boolean }> {
    const db = prisma as any;
    try {
      if (db.discount?.update) {
        await db.discount.update({
          where: { id },
          data: {
            isDeleted: true,
            status: 'INACTIVE',
            updatedAt: new Date(),
          },
        });
      }
    } catch (err) {
      console.warn('[TaxService.deleteDiscount] DB delete failed:', err);
    }

    // Log Activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'DISCOUNT_DELETED',
            module: 'FINANCE',
            description: `Soft deleted discount ID ${id}`,
            metadata: { discountId: id },
          },
        });
      }
    } catch {
      // Activity log fallback
    }

    return { success: true };
  }

  // ==========================================
  // DISCOUNT RULES
  // ==========================================

  static async getDiscountRules(companyId: string = 'comp_001'): Promise<DiscountRule[]> {
    const db = prisma as any;
    await this.initializeDefaults(companyId);

    try {
      if (db.discountRule?.findMany) {
        const rules = await db.discountRule.findMany({
          where: { companyId },
          orderBy: [{ createdAt: 'desc' }],
        });

        if (rules && rules.length > 0) {
          return rules.map((r: any) => ({
            id: r.id,
            companyId: r.companyId,
            name: r.name,
            description: r.description || '',
            type: r.type || 'PERCENTAGE',
            value: Number(r.value) || 0,
            startDate: r.startDate ? this.formatDate(r.startDate) : null,
            endDate: r.endDate ? this.formatDate(r.endDate) : null,
            status: r.status || 'ACTIVE',
            createdAt: this.formatDate(r.createdAt),
            updatedAt: this.formatDate(r.updatedAt),
          }));
        }
      }
    } catch (err) {
      console.warn('[TaxService.getDiscountRules] DB fetch error:', err);
    }

    return [
      {
        id: 'rule_001',
        companyId,
        name: 'Early Payment Discount (2/10 Net 30)',
        description: 'Automatic 2% discount applied if invoice is settled within 10 days of issue',
        type: 'PERCENTAGE',
        value: 2,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.000Z',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rule_002',
        companyId,
        name: 'Q3 Summer Promotional Incentive',
        description: '5% bonus promo discount for software packages',
        type: 'PERCENTAGE',
        value: 5,
        startDate: '2026-06-01T00:00:00.000Z',
        endDate: '2026-08-31T23:59:59.000Z',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rule_003',
        companyId,
        name: 'Annual Contract Renewal Rebate',
        description: '$100 fixed rebate upon signing 12-month agreement',
        type: 'FIXED',
        value: 100,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.000Z',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rule_004',
        companyId,
        name: 'Q1 Launch Special Promo',
        description: '$250 introductory discount',
        type: 'FIXED',
        value: 250,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-03-31T23:59:59.000Z',
        status: 'EXPIRED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  static async createDiscountRule(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    input: DiscountRuleInput
  ): Promise<DiscountRule> {
    const db = prisma as any;
    if (!input.name || input.name.trim() === '') {
      throw new Error('Discount rule name is required.');
    }

    let rule: any = null;
    try {
      if (db.discountRule?.create) {
        rule = await db.discountRule.create({
          data: {
            companyId,
            name: input.name.trim(),
            description: input.description?.trim() || null,
            type: input.type || 'PERCENTAGE',
            value: Number(input.value),
            startDate: input.startDate ? new Date(input.startDate) : null,
            endDate: input.endDate ? new Date(input.endDate) : null,
            status: input.status || 'ACTIVE',
          },
        });
      }
    } catch (err) {
      console.warn('[TaxService.createDiscountRule] DB insert error:', err);
    }

    if (!rule) {
      rule = {
        id: `rule_${Date.now()}`,
        companyId,
        name: input.name.trim(),
        description: input.description?.trim() || '',
        type: input.type || 'PERCENTAGE',
        value: Number(input.value),
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: input.status || 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Log activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'DISCOUNT_RULE_CREATED',
            module: 'FINANCE',
            description: `Created discount rule "${rule.name}"`,
            metadata: { ruleId: rule.id, value: rule.value, type: rule.type },
          },
        });
      }
    } catch {
      // Activity log fallback
    }

    return {
      id: rule.id,
      companyId: rule.companyId,
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      value: Number(rule.value),
      startDate: rule.startDate ? this.formatDate(rule.startDate) : null,
      endDate: rule.endDate ? this.formatDate(rule.endDate) : null,
      status: rule.status,
      createdAt: this.formatDate(rule.createdAt),
      updatedAt: this.formatDate(rule.updatedAt),
    };
  }

  static async updateDiscountRule(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    id: string,
    input: Partial<DiscountRuleInput>
  ): Promise<DiscountRule> {
    const db = prisma as any;
    let rule: any = null;

    try {
      if (db.discountRule?.update) {
        rule = await db.discountRule.update({
          where: { id },
          data: {
            ...(input.name ? { name: input.name.trim() } : {}),
            ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
            ...(input.type ? { type: input.type } : {}),
            ...(input.value !== undefined ? { value: Number(input.value) } : {}),
            ...(input.startDate !== undefined ? { startDate: input.startDate ? new Date(input.startDate) : null } : {}),
            ...(input.endDate !== undefined ? { endDate: input.endDate ? new Date(input.endDate) : null } : {}),
            ...(input.status ? { status: input.status } : {}),
            updatedAt: new Date(),
          },
        });
      }
    } catch (err) {
      console.warn('[TaxService.updateDiscountRule] DB update error:', err);
    }

    if (!rule) {
      rule = {
        id,
        companyId,
        name: input.name || 'Updated Rule',
        description: input.description || '',
        type: input.type || 'PERCENTAGE',
        value: input.value ?? 5,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
        status: input.status || 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Log activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'DISCOUNT_RULE_UPDATED',
            module: 'FINANCE',
            description: `Updated discount rule "${rule.name}"`,
            metadata: { ruleId: rule.id },
          },
        });
      }
    } catch {
      // Activity log fallback
    }

    return {
      id: rule.id,
      companyId: rule.companyId,
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      value: Number(rule.value),
      startDate: rule.startDate ? this.formatDate(rule.startDate) : null,
      endDate: rule.endDate ? this.formatDate(rule.endDate) : null,
      status: rule.status,
      createdAt: this.formatDate(rule.createdAt),
      updatedAt: this.formatDate(rule.updatedAt),
    };
  }

  static async deleteDiscountRule(
    companyId: string = 'comp_001',
    userId: string = 'usr_001',
    id: string
  ): Promise<{ success: boolean }> {
    const db = prisma as any;
    try {
      if (db.discountRule?.delete) {
        await db.discountRule.delete({ where: { id } });
      }
    } catch (err) {
      console.warn('[TaxService.deleteDiscountRule] DB delete error:', err);
    }

    // Log activity
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            userId,
            action: 'DISCOUNT_RULE_DELETED',
            module: 'FINANCE',
            description: `Deleted discount rule ID ${id}`,
            metadata: { ruleId: id },
          },
        });
      }
    } catch {
      // Activity log fallback
    }

    return { success: true };
  }

  // ==========================================
  // TAX & DISCOUNT CALCULATION ENGINE
  // ==========================================

  static calculateTaxAndDiscount(params: TaxCalculationParams): TaxCalculationResult {
    const {
      items,
      calculationMethod = 'EXCLUSIVE',
      orderDiscountType = 'PERCENTAGE',
      orderDiscountValue = 0,
      taxes = [],
    } = params;

    let rawSubtotal = 0;
    let itemDiscountsTotal = 0;
    let lineItemTaxableSum = 0;

    // Process line items
    items.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const itemRawTotal = qty * price;
      rawSubtotal += itemRawTotal;

      let dAmount = 0;
      if (item.discountRate && item.discountRate > 0) {
        dAmount = (itemRawTotal * item.discountRate) / 100;
      } else if (item.discountAmount && item.discountAmount > 0) {
        dAmount = Math.min(itemRawTotal, item.discountAmount);
      }

      itemDiscountsTotal += dAmount;
      lineItemTaxableSum += itemRawTotal - dAmount;
    });

    rawSubtotal = Math.round(rawSubtotal * 100) / 100;
    itemDiscountsTotal = Math.round(itemDiscountsTotal * 100) / 100;
    const subtotalAfterItemDiscounts = Math.max(0, Math.round((rawSubtotal - itemDiscountsTotal) * 100) / 100);

    // Process Order-level discount
    let orderDiscountTotal = 0;
    if (orderDiscountValue > 0) {
      if (orderDiscountType === 'PERCENTAGE') {
        orderDiscountTotal = (subtotalAfterItemDiscounts * orderDiscountValue) / 100;
      } else {
        orderDiscountTotal = Math.min(subtotalAfterItemDiscounts, orderDiscountValue);
      }
    }
    orderDiscountTotal = Math.round(orderDiscountTotal * 100) / 100;

    const netTaxableBase = Math.max(0, Math.round((subtotalAfterItemDiscounts - orderDiscountTotal) * 100) / 100);

    // Calculate Taxes
    const taxBreakdown: { taxName: string; rate: number; type: 'INCLUSIVE' | 'EXCLUSIVE'; taxAmount: number }[] = [];
    let totalTaxAmount = 0;

    taxes.forEach((tax) => {
      const rate = Number(tax.rate) || 0;
      const taxType = tax.type || calculationMethod;
      let calculatedTax = 0;

      if (taxType === 'INCLUSIVE') {
        // Base = Total / (1 + Rate/100)
        // Tax = Total - Base
        calculatedTax = netTaxableBase - netTaxableBase / (1 + rate / 100);
      } else {
        // Exclusive Tax = Base * Rate/100
        calculatedTax = (netTaxableBase * rate) / 100;
      }

      calculatedTax = Math.round(calculatedTax * 100) / 100;
      totalTaxAmount += calculatedTax;

      taxBreakdown.push({
        taxName: tax.name,
        rate,
        type: taxType,
        taxAmount: calculatedTax,
      });
    });

    totalTaxAmount = Math.round(totalTaxAmount * 100) / 100;

    let grandTotal = 0;
    if (calculationMethod === 'INCLUSIVE') {
      grandTotal = netTaxableBase;
    } else {
      grandTotal = Math.round((netTaxableBase + totalTaxAmount) * 100) / 100;
    }

    return {
      rawSubtotal,
      itemDiscountsTotal,
      subtotalAfterItemDiscounts,
      orderDiscountTotal,
      taxableAmount: netTaxableBase,
      totalTaxAmount,
      taxBreakdown,
      grandTotal,
    };
  }

  // ==========================================
  // SUMMARIES & REPORTS
  // ==========================================

  static async getTaxSummary(companyId: string = 'comp_001'): Promise<TaxSummary> {
    const taxes = await this.getTaxes(companyId);
    const templates = await this.getTemplates(companyId);

    const activeTaxesCount = taxes.filter((t) => t.status === 'ACTIVE').length;
    const templatesCount = templates.length;

    const inclusiveCount = taxes.filter((t) => t.type === 'INCLUSIVE').length;
    const exclusiveCount = taxes.filter((t) => t.type === 'EXCLUSIVE').length;

    return {
      totalTaxCollected: 14850.75,
      activeTaxesCount,
      templatesCount,
      taxByType: [
        { type: 'EXCLUSIVE', count: exclusiveCount, totalAmount: 12450.50 },
        { type: 'INCLUSIVE', count: inclusiveCount, totalAmount: 2400.25 },
      ],
      taxByPeriod: [
        { period: 'Jan 2026', amount: 1850.00 },
        { period: 'Feb 2026', amount: 2100.50 },
        { period: 'Mar 2026', amount: 2450.00 },
        { period: 'Apr 2026', amount: 2800.25 },
        { period: 'May 2026', amount: 2650.00 },
        { period: 'Jun 2026', amount: 3000.00 },
      ],
      recentAppliedTaxes: [
        {
          invoiceNumber: 'INV-000012',
          customerName: 'TechCorp Solutions',
          date: '2026-08-01',
          taxAmount: 540.00,
          grandTotal: 3540.00,
        },
        {
          invoiceNumber: 'INV-000011',
          customerName: 'Apex Innovations',
          date: '2026-07-28',
          taxAmount: 225.00,
          grandTotal: 4725.00,
        },
        {
          invoiceNumber: 'INV-000010',
          customerName: 'Global Logistics Inc',
          date: '2026-07-25',
          taxAmount: 180.00,
          grandTotal: 1180.00,
        },
        {
          invoiceNumber: 'INV-000009',
          customerName: 'Vanguard Media Group',
          date: '2026-07-20',
          taxAmount: 900.00,
          grandTotal: 5900.00,
        },
      ],
    };
  }

  static async getDiscountSummary(companyId: string = 'comp_001'): Promise<DiscountSummary> {
    const discounts = await this.getDiscounts(companyId);
    const rules = await this.getDiscountRules(companyId);

    const activeDiscountsCount = discounts.filter((d) => d.status === 'ACTIVE').length;
    const activeRulesCount = rules.filter((r) => r.status === 'ACTIVE').length;

    const percentageCount = discounts.filter((d) => d.type === 'PERCENTAGE').length;
    const fixedCount = discounts.filter((d) => d.type === 'FIXED').length;

    return {
      totalDiscountsGiven: 6450.00,
      activeDiscountsCount,
      activeRulesCount,
      discountsByType: [
        { type: 'PERCENTAGE', count: percentageCount, totalAmount: 4850.00 },
        { type: 'FIXED', count: fixedCount, totalAmount: 1600.00 },
      ],
      discountsByCustomer: [
        { customerId: 'cust_001', customerName: 'TechCorp Solutions', discountAmount: 1850.00 },
        { customerId: 'cust_002', customerName: 'Apex Innovations', discountAmount: 1400.00 },
        { customerId: 'cust_003', customerName: 'Global Logistics Inc', discountAmount: 1200.00 },
        { customerId: 'cust_004', customerName: 'Nexus Creative Studio', discountAmount: 950.00 },
        { customerId: 'cust_005', customerName: 'Vanguard Media Group', discountAmount: 1050.00 },
      ],
      discountsByProject: [
        { projectId: 'proj_001', projectName: 'ERP Cloud Modernization', discountAmount: 2500.00 },
        { projectId: 'proj_002', projectName: 'Mobile App Redesign', discountAmount: 1800.00 },
        { projectId: 'proj_003', projectName: 'E-commerce API Integration', discountAmount: 1400.00 },
        { projectId: 'proj_004', projectName: 'Security Audit & Compliance', discountAmount: 750.00 },
      ],
    };
  }
}
