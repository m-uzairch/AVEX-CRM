/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import {
  InvoiceTemplate,
  CompanyBranding,
  InvoiceTemplateFormValues,
} from '../types/invoice-template-types';

export class InvoiceTemplateService {
  /**
   * Seed / Initialize 4 default built-in templates for company if none exist
   */
  static async initializeDefaultTemplates(companyId: string = 'comp_001'): Promise<void> {
    const db = prisma as any;

    try {
      if (!db.invoiceTemplate) return;
      const count = await db.invoiceTemplate.count({ where: { companyId } }).catch(() => 0);
      if (count > 0) return;

      const defaults: Partial<InvoiceTemplateFormValues>[] = [
        {
          name: 'Classic Corporate',
          layoutStyle: 'CLASSIC',
          isDefault: true,
          primaryColor: '#2563eb', // Blue
          secondaryColor: '#475569',
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
          footerText: 'AVEX CRM Workspace - Official Billing Document',
          defaultTerms: 'Payment due within 14 days of invoice date.',
        },
        {
          name: 'Modern Gradient',
          layoutStyle: 'MODERN',
          isDefault: false,
          primaryColor: '#7c3aed', // Purple
          secondaryColor: '#64748b',
          fontFamily: 'Outfit',
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
          thankYouMessage: 'We appreciate your partnership!',
          footerText: 'Generated automatically by AVEX CRM',
          defaultTerms: 'Net 30 days. Late interest rate 1.5% per month.',
        },
        {
          name: 'Minimal Clean',
          layoutStyle: 'MINIMAL',
          isDefault: false,
          primaryColor: '#0f172a', // Dark Slate
          secondaryColor: '#94a3b8',
          fontFamily: 'Inter',
          fontSize: 'COMPACT',
          logoPosition: 'CENTER',
          headerAlignment: 'CENTER',
          showCompanyAddress: true,
          showPhone: false,
          showEmail: true,
          showWebsite: true,
          showTaxNumber: false,
          visibleColumns: ['name', 'qty', 'price', 'total'],
          visibleSummaryFields: ['subtotal', 'grandTotal', 'balance'],
          thankYouMessage: 'Thank you.',
          footerText: 'AVEX Clean Billing',
          defaultTerms: 'Payment due upon receipt.',
        },
        {
          name: 'Executive Professional',
          layoutStyle: 'PROFESSIONAL',
          isDefault: false,
          primaryColor: '#059669', // Emerald Green
          secondaryColor: '#334155',
          fontFamily: 'Roboto',
          fontSize: 'LARGE',
          logoPosition: 'RIGHT',
          headerAlignment: 'LEFT',
          showCompanyAddress: true,
          showPhone: true,
          showEmail: true,
          showWebsite: true,
          showTaxNumber: true,
          visibleColumns: ['name', 'description', 'qty', 'price', 'discount', 'tax', 'total'],
          visibleSummaryFields: ['subtotal', 'discount', 'tax', 'grandTotal', 'amountPaid', 'balance'],
          thankYouMessage: 'Thank you for choosing our professional services.',
          footerText: 'AVEX CRM Executive Invoice',
          defaultTerms: 'Strict 14-day payment policy applies.',
        },
      ];

      for (const item of defaults) {
        await db.invoiceTemplate.create({
          data: {
            companyId,
            name: item.name!,
            layoutStyle: item.layoutStyle!,
            isDefault: !!item.isDefault,
            isBuiltIn: true,
            primaryColor: item.primaryColor!,
            secondaryColor: item.secondaryColor!,
            fontFamily: item.fontFamily!,
            fontSize: item.fontSize!,
            logoPosition: item.logoPosition!,
            headerAlignment: item.headerAlignment!,
            showCompanyAddress: item.showCompanyAddress!,
            showPhone: item.showPhone!,
            showEmail: item.showEmail!,
            showWebsite: item.showWebsite!,
            showTaxNumber: item.showTaxNumber!,
            visibleColumns: item.visibleColumns || [],
            visibleSummaryFields: item.visibleSummaryFields || [],
            thankYouMessage: item.thankYouMessage || null,
            footerText: item.footerText || null,
            defaultTerms: item.defaultTerms || null,
          },
        }).catch(() => null);
      }
    } catch (err) {
      console.warn('[InvoiceTemplateService.initializeDefaultTemplates] Warning:', err);
    }
  }

  /**
   * Fetch all templates for company
   */
  static async getTemplates(companyId: string = 'comp_001'): Promise<InvoiceTemplate[]> {
    const db = prisma as any;
    await this.initializeDefaultTemplates(companyId);

    try {
      if (db.invoiceTemplate?.findMany) {
        const templates = await db.invoiceTemplate.findMany({
          where: { companyId },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        });

        if (templates && templates.length > 0) {
          return templates.map((t: any) => ({
            ...t,
            createdAt: t.createdAt ? (t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt)) : new Date().toISOString(),
            updatedAt: t.updatedAt ? (t.updatedAt instanceof Date ? t.updatedAt.toISOString() : String(t.updatedAt)) : new Date().toISOString(),
            visibleColumns: Array.isArray(t.visibleColumns) ? t.visibleColumns : ['name', 'description', 'qty', 'price', 'total'],
            visibleSummaryFields: Array.isArray(t.visibleSummaryFields) ? t.visibleSummaryFields : ['subtotal', 'grandTotal', 'balance'],
          }));
        }
      }
    } catch (err) {
      console.warn('[InvoiceTemplateService.getTemplates] DB query failed, returning fallback templates:', err);
    }

    return [
      {
        id: 'tmpl_classic_001',
        companyId,
        name: 'Classic Corporate',
        layoutStyle: 'CLASSIC',
        isDefault: true,
        isBuiltIn: true,
        primaryColor: '#2563eb',
        secondaryColor: '#475569',
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
        footerText: 'AVEX CRM Workspace - Official Billing Document',
        defaultTerms: 'Payment due within 14 days of invoice date.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tmpl_modern_002',
        companyId,
        name: 'Modern Gradient',
        layoutStyle: 'MODERN',
        isDefault: false,
        isBuiltIn: true,
        primaryColor: '#7c3aed',
        secondaryColor: '#64748b',
        fontFamily: 'Outfit',
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
        thankYouMessage: 'We appreciate your partnership!',
        footerText: 'Generated automatically by AVEX CRM',
        defaultTerms: 'Net 30 days. Late interest rate 1.5% per month.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Fetch single template by ID
   */
  static async getTemplateById(id: string): Promise<InvoiceTemplate | null> {
    const db = prisma as any;
    try {
      if (db.invoiceTemplate?.findUnique) {
        const t = await db.invoiceTemplate.findUnique({
          where: { id },
        });
        if (t) {
          return {
            ...t,
            createdAt: t.createdAt ? (t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt)) : new Date().toISOString(),
            updatedAt: t.updatedAt ? (t.updatedAt instanceof Date ? t.updatedAt.toISOString() : String(t.updatedAt)) : new Date().toISOString(),
            visibleColumns: Array.isArray(t.visibleColumns) ? t.visibleColumns : ['name', 'description', 'qty', 'price', 'total'],
            visibleSummaryFields: Array.isArray(t.visibleSummaryFields) ? t.visibleSummaryFields : ['subtotal', 'grandTotal', 'balance'],
          };
        }
      }
    } catch (err) {
      console.warn('[InvoiceTemplateService.getTemplateById] Error:', err);
    }
    return null;
  }

  /**
   * Create custom invoice template
   */
  static async createTemplate(
    companyId: string = 'comp_001',
    createdById: string = 'usr_001',
    values: InvoiceTemplateFormValues
  ): Promise<InvoiceTemplate> {
    const db = prisma as any;

    if (values.isDefault) {
      try {
        if (db.invoiceTemplate?.updateMany) {
          await db.invoiceTemplate.updateMany({
            where: { companyId },
            data: { isDefault: false },
          });
        }
      } catch {
        // Fallback
      }
    }

    let created: any = null;
    try {
      if (db.invoiceTemplate?.create) {
        created = await db.invoiceTemplate.create({
          data: {
            companyId,
            createdById,
            name: values.name,
            layoutStyle: values.layoutStyle,
            isDefault: values.isDefault ?? false,
            isBuiltIn: false,
            primaryColor: values.primaryColor,
            secondaryColor: values.secondaryColor,
            fontFamily: values.fontFamily,
            fontSize: values.fontSize,
            logoPosition: values.logoPosition,
            headerAlignment: values.headerAlignment,
            showCompanyAddress: values.showCompanyAddress,
            showPhone: values.showPhone,
            showEmail: values.showEmail,
            showWebsite: values.showWebsite,
            showTaxNumber: values.showTaxNumber,
            visibleColumns: values.visibleColumns,
            visibleSummaryFields: values.visibleSummaryFields,
            thankYouMessage: values.thankYouMessage || null,
            footerText: values.footerText || null,
            defaultTerms: values.defaultTerms || null,
          },
        });
      }
    } catch (err) {
      console.warn('[InvoiceTemplateService.createTemplate] DB insert failed:', err);
    }

    if (!created) {
      created = {
        id: `tmpl_${Date.now()}`,
        companyId,
        createdById,
        name: values.name,
        layoutStyle: values.layoutStyle,
        isDefault: values.isDefault ?? false,
        isBuiltIn: false,
        primaryColor: values.primaryColor,
        secondaryColor: values.secondaryColor,
        fontFamily: values.fontFamily,
        fontSize: values.fontSize,
        logoPosition: values.logoPosition,
        headerAlignment: values.headerAlignment,
        showCompanyAddress: values.showCompanyAddress,
        showPhone: values.showPhone,
        showEmail: values.showEmail,
        showWebsite: values.showWebsite,
        showTaxNumber: values.showTaxNumber,
        visibleColumns: values.visibleColumns,
        visibleSummaryFields: values.visibleSummaryFields,
        thankYouMessage: values.thankYouMessage || null,
        footerText: values.footerText || null,
        defaultTerms: values.defaultTerms || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return {
      ...created,
      createdAt: created.createdAt instanceof Date ? created.createdAt.toISOString() : String(created.createdAt),
      updatedAt: created.updatedAt instanceof Date ? created.updatedAt.toISOString() : String(created.updatedAt),
    };
  }

  /**
   * Update invoice template
   */
  static async updateTemplate(
    id: string,
    values: Partial<InvoiceTemplateFormValues>
  ): Promise<InvoiceTemplate> {
    const db = prisma as any;

    if (values.isDefault) {
      try {
        const t = await db.invoiceTemplate.findUnique({ where: { id } });
        if (t && db.invoiceTemplate?.updateMany) {
          await db.invoiceTemplate.updateMany({
            where: { companyId: t.companyId },
            data: { isDefault: false },
          });
        }
      } catch {
        // Fallback
      }
    }

    let updated: any = null;
    try {
      if (db.invoiceTemplate?.update) {
        updated = await db.invoiceTemplate.update({
          where: { id },
          data: {
            ...values,
            updatedAt: new Date(),
          },
        });
      }
    } catch (err) {
      console.warn('[InvoiceTemplateService.updateTemplate] DB update failed:', err);
    }

    if (!updated) {
      updated = {
        id,
        name: values.name || 'Updated Template',
        layoutStyle: values.layoutStyle || 'CLASSIC',
        isDefault: values.isDefault ?? false,
        isBuiltIn: false,
        primaryColor: values.primaryColor || '#2563eb',
        secondaryColor: values.secondaryColor || '#475569',
        fontFamily: values.fontFamily || 'Inter',
        fontSize: values.fontSize || 'NORMAL',
        logoPosition: values.logoPosition || 'LEFT',
        headerAlignment: values.headerAlignment || 'LEFT',
        showCompanyAddress: values.showCompanyAddress ?? true,
        showPhone: values.showPhone ?? true,
        showEmail: values.showEmail ?? true,
        showWebsite: values.showWebsite ?? true,
        showTaxNumber: values.showTaxNumber ?? true,
        visibleColumns: values.visibleColumns || ['name', 'description', 'qty', 'price', 'total'],
        visibleSummaryFields: values.visibleSummaryFields || ['subtotal', 'grandTotal'],
        thankYouMessage: values.thankYouMessage || null,
        footerText: values.footerText || null,
        defaultTerms: values.defaultTerms || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return {
      ...updated,
      createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : String(updated.createdAt),
      updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : String(updated.updatedAt),
    };
  }

  /**
   * Get company branding
   */
  static async getCompanyBranding(companyId: string = 'comp_001'): Promise<CompanyBranding> {
    const db = prisma as any;

    try {
      if (db.companyBranding?.findUnique) {
        const b = await db.companyBranding.findUnique({
          where: { companyId },
        });
        if (b) return b;
      }
    } catch (err) {
      console.warn('[InvoiceTemplateService.getCompanyBranding] DB query failed, returning default branding:', err);
    }

    return {
      companyId,
      companyName: 'AVEX Enterprise',
      logoUrl: null,
      taxNumber: 'TAX-98402941',
      website: 'www.avexcrm.io',
      phone: '+1 (800) 555-0199',
      email: 'billing@avexcrm.io',
      address: '100 Innovation Way, Suite 400',
      city: 'Tech City',
      state: 'CA',
      zip: '94016',
      country: 'United States',
    };
  }

  /**
   * Update company branding
   */
  static async updateCompanyBranding(
    companyId: string = 'comp_001',
    data: Partial<CompanyBranding>
  ): Promise<CompanyBranding> {
    const db = prisma as any;

    let b: any = null;
    try {
      if (db.companyBranding?.upsert) {
        b = await db.companyBranding.upsert({
          where: { companyId },
          update: {
            companyName: data.companyName,
            logoUrl: data.logoUrl,
            taxNumber: data.taxNumber,
            website: data.website,
            phone: data.phone,
            email: data.email,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            country: data.country,
            updatedAt: new Date(),
          },
          create: {
            companyId,
            companyName: data.companyName || 'AVEX Enterprise',
            logoUrl: data.logoUrl || null,
            taxNumber: data.taxNumber || null,
            website: data.website || null,
            phone: data.phone || null,
            email: data.email || null,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            zip: data.zip || null,
            country: data.country || null,
          },
        });
      }
    } catch (err) {
      console.warn('[InvoiceTemplateService.updateCompanyBranding] DB upsert failed:', err);
    }

    if (!b) {
      b = {
        companyId,
        companyName: data.companyName || 'AVEX Enterprise',
        logoUrl: data.logoUrl || null,
        taxNumber: data.taxNumber || 'TAX-98402941',
        website: data.website || 'www.avexcrm.io',
        phone: data.phone || '+1 (800) 555-0199',
        email: data.email || 'billing@avexcrm.io',
        address: data.address || '100 Innovation Way, Suite 400',
        city: data.city || 'Tech City',
        state: data.state || 'CA',
        zip: data.zip || '94016',
        country: data.country || 'United States',
      };
    }

    return b;
  }

  /**
   * Set default template for company
   */
  static async setDefaultTemplate(companyId: string, id: string): Promise<InvoiceTemplate> {
    const db = prisma as any;
    try {
      if (db.invoiceTemplate?.updateMany) {
        await db.invoiceTemplate.updateMany({
          where: { companyId },
          data: { isDefault: false },
        });
        await db.invoiceTemplate.update({
          where: { id },
          data: { isDefault: true },
        });
      }
    } catch (err) {
      console.warn('[InvoiceTemplateService.setDefaultTemplate] DB error:', err);
    }
    const t = await this.getTemplateById(id);
    return t || (await this.getTemplates(companyId))[0];
  }

  /**
   * Duplicate template
   */
  static async duplicateTemplate(id: string, createdById: string = 'usr_001'): Promise<InvoiceTemplate> {
    const original = await this.getTemplateById(id);
    if (!original) throw new Error('Template not found');

    return this.createTemplate(original.companyId, createdById, {
      name: `${original.name} (Copy)`,
      layoutStyle: original.layoutStyle,
      isDefault: false,
      primaryColor: original.primaryColor,
      secondaryColor: original.secondaryColor,
      fontFamily: original.fontFamily,
      fontSize: original.fontSize,
      logoPosition: original.logoPosition,
      headerAlignment: original.headerAlignment,
      showCompanyAddress: original.showCompanyAddress,
      showPhone: original.showPhone,
      showEmail: original.showEmail,
      showWebsite: original.showWebsite,
      showTaxNumber: original.showTaxNumber,
      visibleColumns: original.visibleColumns,
      visibleSummaryFields: original.visibleSummaryFields,
      thankYouMessage: original.thankYouMessage || undefined,
      footerText: original.footerText || undefined,
      defaultTerms: original.defaultTerms || undefined,
    });
  }

  /**
   * Delete template
   */
  static async deleteTemplate(id: string): Promise<{ success: boolean }> {
    const db = prisma as any;
    try {
      if (db.invoiceTemplate?.delete) {
        await db.invoiceTemplate.delete({ where: { id } });
      }
    } catch (err) {
      console.warn('[InvoiceTemplateService.deleteTemplate] DB error:', err);
    }
    return { success: true };
  }
}
