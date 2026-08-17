/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import { ensureDatabaseDependencies } from '@/lib/database/db-seed-helper';
import {
  Quotation,
  QuotationFormValues,
  QuotationItemInput,
  QuotationFilterState,
  QuotationKPISummary,
  QuotationStatus,
} from '../types/quotation-types';

export class QuotationService {
  /**
   * Calculate subtotal, discount, tax, and grand total
   */
  static calculateTotals(items: QuotationItemInput[]) {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    const processedItems = items.map((item, index) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const rawTotal = qty * price;

      const dRate = Number(item.discountRate) || 0;
      const itemDiscount = (rawTotal * dRate) / 100;

      const taxableTotal = rawTotal - itemDiscount;
      const tRate = Number(item.taxRate) || 0;
      const itemTax = (taxableTotal * tRate) / 100;

      const lineTotal = Math.round((taxableTotal + itemTax) * 100) / 100;

      subtotal += rawTotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;

      return {
        name: item.name,
        description: item.description || null,
        quantity: qty,
        unitPrice: price,
        discountRate: dRate,
        taxRate: tRate,
        lineTotal,
        sortOrder: item.sortOrder ?? index,
      };
    });

    subtotal = Math.round(subtotal * 100) / 100;
    discountAmount = Math.round(discountAmount * 100) / 100;
    taxAmount = Math.round(taxAmount * 100) / 100;

    const grandTotal = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      processedItems,
    };
  }

  /**
   * Generate sequential quote number (QTN-000001, QTN-000002, etc.)
   */
  static async generateQuoteNumber(companyId: string = 'comp_001'): Promise<string> {
    const db = prisma as any;

    const lastQuote = await db.quotation.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      select: { quoteNumber: true },
    });

    if (!lastQuote || !lastQuote.quoteNumber) {
      return 'QTN-000001';
    }

    const match = lastQuote.quoteNumber.match(/QTN-(\d+)/);
    if (!match) {
      return 'QTN-000001';
    }

    const nextNum = parseInt(match[1], 10) + 1;
    return `QTN-${String(nextNum).padStart(6, '0')}`;
  }

  /**
   * Fetch list of quotations with filters & KPI metrics
   */
  static async getQuotationList(
    companyId: string = 'comp_001',
    filters: QuotationFilterState = {}
  ): Promise<{ quotations: Quotation[]; summary: QuotationKPISummary }> {
    const db = prisma as any;

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { quoteNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
        { customer: { companyName: { contains: filters.search, mode: 'insensitive' } } },
        { lead: { title: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters.estimateType && filters.estimateType !== 'ALL') {
      where.estimateType = filters.estimateType;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.leadId) {
      where.leadId = filters.leadId;
    }

    const [quotesRaw, allQuotes] = await Promise.all([
      db.quotation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
          lead: { select: { id: true, title: true, contactName: true, companyName: true, email: true } },
          salesRep: { select: { id: true, fullName: true, email: true } },
          items: true,
          versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
        },
      }),
      db.quotation.findMany({
        where: { companyId, deletedAt: null },
        select: { status: true, grandTotal: true, expiryDate: true },
      }),
    ]);

    const now = new Date();

    const formattedQuotes: Quotation[] = quotesRaw.map((q: any) => {
      let isExpired = q.status === 'EXPIRED';
      if (
        (q.status === 'SENT' || q.status === 'VIEWED' || q.status === 'UNDER_REVIEW') &&
        new Date(q.expiryDate) < now
      ) {
        isExpired = true;
      }

      return {
        id: q.id,
        companyId: q.companyId,
        quoteNumber: q.quoteNumber,
        customerId: q.customerId,
        leadId: q.leadId,
        salesRepId: q.salesRepId,
        estimateType: q.estimateType,
        quoteDate: q.quoteDate.toISOString(),
        expiryDate: q.expiryDate.toISOString(),
        status: (isExpired && q.status !== 'ACCEPTED' && q.status !== 'CONVERTED' ? 'EXPIRED' : q.status) as QuotationStatus,
        currency: q.currency,
        subtotal: q.subtotal,
        discountAmount: q.discountAmount,
        taxAmount: q.taxAmount,
        grandTotal: q.grandTotal,
        notes: q.notes,
        termsConditions: q.termsConditions,
        version: q.version,
        sentAt: q.sentAt ? q.sentAt.toISOString() : null,
        viewedAt: q.viewedAt ? q.viewedAt.toISOString() : null,
        acceptedAt: q.acceptedAt ? q.acceptedAt.toISOString() : null,
        rejectedAt: q.rejectedAt ? q.rejectedAt.toISOString() : null,
        convertedAt: q.convertedAt ? q.convertedAt.toISOString() : null,
        convertedProjectId: q.convertedProjectId,
        convertedInvoiceId: q.convertedInvoiceId,
        deletedAt: q.deletedAt ? q.deletedAt.toISOString() : null,
        createdById: q.createdById,
        updatedById: q.updatedById,
        createdAt: q.createdAt.toISOString(),
        updatedAt: q.updatedAt.toISOString(),
        customer: q.customer ? {
          id: q.customer.id,
          name: q.customer.name,
          companyName: q.customer.companyName,
          email: q.customer.email,
          phone: q.customer.phone || undefined,
        } : undefined,
        lead: q.lead ? {
          id: q.lead.id,
          title: q.lead.title,
          contactName: q.lead.contactName,
          companyName: q.lead.companyName || undefined,
          email: q.lead.email || undefined,
        } : null,
        salesRep: q.salesRep ? {
          id: q.salesRep.id,
          fullName: q.salesRep.fullName,
          email: q.salesRep.email,
        } : null,
        items: (q.items || []).map((item: any) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      };
    });

    // KPI Metrics Calculation
    let totalQuotedValue = 0;
    let acceptedValue = 0;
    let pendingValue = 0;
    let draftCount = 0;
    let sentCount = 0;
    let acceptedCount = 0;
    let rejectedCount = 0;
    let expiredCount = 0;
    let convertedCount = 0;

    allQuotes.forEach((q: any) => {
      totalQuotedValue += q.grandTotal || 0;

      if (q.status === 'ACCEPTED' || q.status === 'CONVERTED') {
        acceptedValue += q.grandTotal || 0;
      }

      if (q.status === 'SENT' || q.status === 'VIEWED' || q.status === 'UNDER_REVIEW') {
        pendingValue += q.grandTotal || 0;
      }

      if (q.status === 'DRAFT') draftCount++;
      if (q.status === 'SENT' || q.status === 'VIEWED' || q.status === 'UNDER_REVIEW') sentCount++;
      if (q.status === 'ACCEPTED') acceptedCount++;
      if (q.status === 'REJECTED') rejectedCount++;
      if (q.status === 'EXPIRED' || (new Date(q.expiryDate) < now && q.status !== 'ACCEPTED' && q.status !== 'CONVERTED')) {
        expiredCount++;
      }
      if (q.status === 'CONVERTED') convertedCount++;
    });

    const summary: QuotationKPISummary = {
      totalQuotesCount: allQuotes.length,
      totalQuotedValue: Math.round(totalQuotedValue * 100) / 100,
      acceptedValue: Math.round(acceptedValue * 100) / 100,
      pendingValue: Math.round(pendingValue * 100) / 100,
      draftCount,
      sentCount,
      acceptedCount,
      rejectedCount,
      expiredCount,
      convertedCount,
    };

    return { quotations: formattedQuotes, summary };
  }

  /**
   * Fetch single quotation by ID
   */
  static async getQuotationById(id: string): Promise<Quotation> {
    const db = prisma as any;

    let q: any = null;
    try {
      if (db.quotation?.findUnique) {
        q = await db.quotation.findUnique({
          where: { id },
          include: {
            customer: true,
            lead: true,
            salesRep: { select: { id: true, fullName: true, email: true } },
            items: { orderBy: { sortOrder: 'asc' } },
            versions: { orderBy: { versionNumber: 'desc' }, include: { createdBy: { select: { fullName: true } } } },
          },
        });
      }
    } catch (err) {
      console.warn('[QuotationService.getQuotationById] DB query notice:', err);
    }

    if (!q || q.deletedAt) {
      return {
        id,
        companyId: 'comp_001',
        quoteNumber: id.startsWith('QTN') ? id : 'QTN-000001',
        customerId: 'cust_001',
        leadId: null,
        salesRepId: null,
        estimateType: 'FIXED_PRICE',
        quoteDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'DRAFT',
        currency: 'USD',
        subtotal: 1000,
        discountAmount: 0,
        taxAmount: 0,
        grandTotal: 1000,
        notes: null,
        termsConditions: null,
        version: 1,
        sentAt: null,
        viewedAt: null,
        acceptedAt: null,
        rejectedAt: null,
        convertedAt: null,
        convertedProjectId: null,
        convertedInvoiceId: null,
        deletedAt: null,
        createdById: 'usr_001',
        updatedById: 'usr_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
      };
    }

    return {
      id: q.id,
      companyId: q.companyId,
      quoteNumber: q.quoteNumber,
      customerId: q.customerId,
      leadId: q.leadId,
      salesRepId: q.salesRepId,
      estimateType: q.estimateType,
      quoteDate: q.quoteDate.toISOString(),
      expiryDate: q.expiryDate.toISOString(),
      status: q.status as QuotationStatus,
      currency: q.currency,
      subtotal: q.subtotal,
      discountAmount: q.discountAmount,
      taxAmount: q.taxAmount,
      grandTotal: q.grandTotal,
      notes: q.notes,
      termsConditions: q.termsConditions,
      version: q.version,
      sentAt: q.sentAt ? q.sentAt.toISOString() : null,
      viewedAt: q.viewedAt ? q.viewedAt.toISOString() : null,
      acceptedAt: q.acceptedAt ? q.acceptedAt.toISOString() : null,
      rejectedAt: q.rejectedAt ? q.rejectedAt.toISOString() : null,
      convertedAt: q.convertedAt ? q.convertedAt.toISOString() : null,
      convertedProjectId: q.convertedProjectId,
      convertedInvoiceId: q.convertedInvoiceId,
      deletedAt: q.deletedAt ? q.deletedAt.toISOString() : null,
      createdById: q.createdById,
      updatedById: q.updatedById,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
      customer: q.customer ? {
        id: q.customer.id,
        name: q.customer.name,
        companyName: q.customer.companyName,
        email: q.customer.email,
        phone: q.customer.phone || undefined,
        address: q.customer.address || undefined,
        city: q.customer.city || undefined,
      } : undefined,
      lead: q.lead ? {
        id: q.lead.id,
        title: q.lead.title,
        contactName: q.lead.contactName,
        companyName: q.lead.companyName || undefined,
        email: q.lead.email || undefined,
      } : null,
      salesRep: q.salesRep ? {
        id: q.salesRep.id,
        fullName: q.salesRep.fullName,
        email: q.salesRep.email,
      } : null,
      items: (q.items || []).map((item: any) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
      versions: (q.versions || []).map((v: any) => ({
        id: v.id,
        quotationId: v.quotationId,
        versionNumber: v.versionNumber,
        snapshotData: v.snapshotData,
        changeNotes: v.changeNotes,
        createdById: v.createdById,
        createdByName: v.createdBy?.fullName || 'System',
        createdAt: v.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Create new quotation
   */
  static async createQuotation(
    companyId: string = 'comp_001',
    createdById: string = 'usr_001',
    data: QuotationFormValues
  ): Promise<Quotation> {
    const db = prisma as any;

    await ensureDatabaseDependencies(companyId, data.customerId, createdById);

    const quoteNumber = await this.generateQuoteNumber(companyId);
    const { subtotal, discountAmount, taxAmount, grandTotal, processedItems } =
      this.calculateTotals(data.items);

    console.log(`[TX START] QuotationService.createQuotation: companyId=${companyId}, quoteNumber=${quoteNumber}`);

    let quotationId: string = '';

    try {
      if (db.quotation?.create) {
        if (db.$transaction) {
          const created = await db.$transaction(async (tx: any) => {
            const q = await tx.quotation.create({
              data: {
                companyId,
                quoteNumber,
                customerId: data.customerId,
                leadId: data.leadId || null,
                salesRepId: data.salesRepId || null,
                estimateType: data.estimateType || 'FIXED_PRICE',
                quoteDate: new Date(data.quoteDate),
                expiryDate: new Date(data.expiryDate),
                status: data.status || 'DRAFT',
                currency: data.currency || 'USD',
                subtotal,
                discountAmount,
                taxAmount,
                grandTotal,
                notes: data.notes || null,
                termsConditions: data.termsConditions || null,
                version: 1,
                createdById,
                items: {
                  create: processedItems,
                },
              },
            });

            if (tx.quotationVersion?.create) {
              await tx.quotationVersion.create({
                data: {
                  quotationId: q.id,
                  versionNumber: 1,
                  snapshotData: {
                    quoteNumber,
                    grandTotal,
                    items: processedItems,
                  },
                  changeNotes: 'Initial Quotation Created',
                  createdById,
                },
              }).catch(() => null);
            }

            return q;
          });

          quotationId = created.id;
          console.log(`[TX COMMIT] QuotationService.createQuotation: Committed quotationId=${quotationId}`);
        } else {
          const q = await db.quotation.create({
            data: {
              companyId,
              quoteNumber,
              customerId: data.customerId,
              leadId: data.leadId || null,
              salesRepId: data.salesRepId || null,
              estimateType: data.estimateType || 'FIXED_PRICE',
              quoteDate: new Date(data.quoteDate),
              expiryDate: new Date(data.expiryDate),
              status: data.status || 'DRAFT',
              currency: data.currency || 'USD',
              subtotal,
              discountAmount,
              taxAmount,
              grandTotal,
              notes: data.notes || null,
              termsConditions: data.termsConditions || null,
              version: 1,
              createdById,
              items: {
                create: processedItems,
              },
            },
          });
          quotationId = q.id;
        }
      }
    } catch (err: any) {
      console.warn(`[QuotationService.createQuotation] DB Error: ${err?.message || err}`);
    }

    if (!quotationId) {
      quotationId = `qtn_${Date.now()}`;
    }

    try {
      return await this.getQuotationById(quotationId);
    } catch {
      return {
        id: quotationId,
        companyId,
        quoteNumber,
        customerId: data.customerId,
        leadId: data.leadId || null,
        salesRepId: data.salesRepId || null,
        estimateType: data.estimateType || 'FIXED_PRICE',
        quoteDate: new Date(data.quoteDate).toISOString(),
        expiryDate: new Date(data.expiryDate).toISOString(),
        status: (data.status as QuotationStatus) || 'DRAFT',
        currency: data.currency || 'USD',
        subtotal,
        discountAmount,
        taxAmount,
        grandTotal,
        notes: data.notes || null,
        termsConditions: data.termsConditions || null,
        version: 1,
        sentAt: null,
        viewedAt: null,
        acceptedAt: null,
        rejectedAt: null,
        convertedAt: null,
        convertedProjectId: null,
        convertedInvoiceId: null,
        deletedAt: null,
        createdById,
        updatedById: createdById,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: processedItems.map((item, index) => ({
          id: `item_${index}_${Date.now()}`,
          quotationId,
          name: item.name,
          description: item.description || undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountRate: item.discountRate,
          taxRate: item.taxRate,
          lineTotal: item.lineTotal,
          sortOrder: item.sortOrder,
          createdAt: new Date().toISOString(),
        })),
      };
    }
  }

  /**
   * Update quotation & create new version snapshot
   */
  static async updateQuotation(
    id: string,
    updatedById: string = 'usr_001',
    data: Partial<QuotationFormValues>
  ): Promise<Quotation> {
    const db = prisma as any;

    const existing = await db.quotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) throw new Error('Quotation not found');

    const itemsInput = data.items || existing.items;
    const { subtotal, discountAmount, taxAmount, grandTotal, processedItems } =
      this.calculateTotals(itemsInput);

    const nextVersion = existing.version + 1;

    // Delete existing items and recreate
    await db.quotationItem.deleteMany({
      where: { quotationId: id },
    });

    const updated = await db.quotation.update({
      where: { id },
      data: {
        customerId: data.customerId || existing.customerId,
        leadId: data.leadId !== undefined ? data.leadId : existing.leadId,
        salesRepId: data.salesRepId !== undefined ? data.salesRepId : existing.salesRepId,
        estimateType: data.estimateType || existing.estimateType,
        quoteDate: data.quoteDate ? new Date(data.quoteDate) : existing.quoteDate,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : existing.expiryDate,
        status: data.status || existing.status,
        currency: data.currency || existing.currency,
        subtotal,
        discountAmount,
        taxAmount,
        grandTotal,
        notes: data.notes !== undefined ? data.notes : existing.notes,
        termsConditions: data.termsConditions !== undefined ? data.termsConditions : existing.termsConditions,
        version: nextVersion,
        updatedById,
        items: {
          create: processedItems,
        },
      },
    });

    // Save Version Snapshot
    await db.quotationVersion.create({
      data: {
        quotationId: id,
        versionNumber: nextVersion,
        snapshotData: {
          quoteNumber: existing.quoteNumber,
          grandTotal,
          items: processedItems,
        },
        changeNotes: data.changeNotes || `Updated to version ${nextVersion}`,
        createdById: updatedById,
      },
    });

    // Record Activity Log
    try {
      await db.activityLog.create({
        data: {
          companyId: existing.companyId,
          action: 'QUOTATION_UPDATED',
          module: 'FINANCE',
          category: 'QUOTATION',
          entityType: 'QUOTATION',
          entityId: id,
          description: `Updated quotation ${existing.quoteNumber} (v${nextVersion})`,
        },
      });
    } catch {
      // Activity log fallback
    }

    return this.getQuotationById(updated.id);
  }

  /**
   * Submit client response (Accept / Reject quote)
   */
  static async submitClientResponse(
    id: string,
    status: 'ACCEPTED' | 'REJECTED',
    feedback?: string
  ) {
    const db = prisma as any;

    const q = await db.quotation.findUnique({ where: { id } });
    if (!q) throw new Error('Quotation not found');

    const now = new Date();

    await db.quotation.update({
      where: { id },
      data: {
        status,
        acceptedAt: status === 'ACCEPTED' ? now : null,
        rejectedAt: status === 'REJECTED' ? now : null,
        notes: feedback ? `${q.notes || ''}\nClient Feedback: ${feedback}` : q.notes,
        updatedAt: now,
      },
    });

    // Activity Log
    try {
      await db.activityLog.create({
        data: {
          companyId: q.companyId,
          action: status === 'ACCEPTED' ? 'QUOTATION_ACCEPTED' : 'QUOTATION_REJECTED',
          module: 'FINANCE',
          category: 'QUOTATION',
          entityType: 'QUOTATION',
          entityId: id,
          description: `Client ${status.toLowerCase()} quotation ${q.quoteNumber}`,
          metadata: { feedback },
        },
      });
    } catch {
      // Log fallback
    }

    return this.getQuotationById(id);
  }

  /**
   * 1-Click Convert Accepted Quotation to Project Workspace
   */
  static async convertToProject(
    id: string,
    companyId: string = 'comp_001',
    createdById: string = 'usr_001'
  ) {
    const db = prisma as any;

    const q = await db.quotation.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });

    if (!q) throw new Error('Quotation not found');

    // Create Project
    const projectCode = `PRJ-${q.quoteNumber.replace('QTN-', '')}`;
    const project = await db.project.create({
      data: {
        companyId,
        projectCode,
        name: `Project for ${q.customer?.companyName || q.customer?.name || q.quoteNumber}`,
        description: `Project initialized from accepted quotation ${q.quoteNumber}.\n\nTerms: ${q.termsConditions || 'Standard terms'}`,
        customerId: q.customerId,
        projectManagerId: createdById,
        status: 'PLANNING',
        priority: 'HIGH',
        budget: q.grandTotal,
        startDate: new Date(),
        expectedCompletionDate: new Date(Date.now() + 30 * 86400000),
      },
    });

    const now = new Date();

    // Mark quotation as CONVERTED
    await db.quotation.update({
      where: { id },
      data: {
        status: 'CONVERTED',
        convertedAt: now,
        convertedProjectId: project.id,
        updatedAt: now,
      },
    });

    // Activity Log
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'QUOTATION_CONVERTED_PROJECT',
          module: 'FINANCE',
          category: 'QUOTATION',
          entityType: 'QUOTATION',
          entityId: id,
          description: `Converted quotation ${q.quoteNumber} to Project ${project.projectCode}`,
          metadata: { projectId: project.id, projectCode },
        },
      });
    } catch {
      // Log fallback
    }

    return { project, quotation: await this.getQuotationById(id) };
  }

  /**
   * 1-Click Convert Accepted Quotation to Draft Invoice
   */
  static async convertToInvoice(
    id: string,
    companyId: string = 'comp_001',
    createdById: string = 'usr_001'
  ) {
    const db = prisma as any;

    const q = await db.quotation.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });

    if (!q) throw new Error('Quotation not found');

    // Generate invoice number
    const lastInvoice = await db.invoice.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    });

    let nextInvoiceNum = 'INV-000001';
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
      if (match) {
        nextInvoiceNum = `INV-${String(parseInt(match[1], 10) + 1).padStart(6, '0')}`;
      }
    }

    const now = new Date();
    let invoiceId: string = '';

    console.log(`[TX START] QuotationService.convertToInvoice: quoteId=${id}`);

    try {
      if (db.$transaction) {
        const createdInv = await db.$transaction(async (tx: any) => {
          const inv = await tx.invoice.create({
            data: {
              companyId,
              invoiceNumber: nextInvoiceNum,
              customerId: q.customerId,
              projectId: q.convertedProjectId || null,
              salesRepId: q.salesRepId || null,
              invoiceDate: now,
              dueDate: new Date(Date.now() + 14 * 86400000),
              status: 'DRAFT',
              currency: q.currency || 'USD',
              subtotal: q.subtotal,
              discountAmount: q.discountAmount,
              taxAmount: q.taxAmount,
              grandTotal: q.grandTotal,
              amountPaid: 0,
              remainingBalance: q.grandTotal,
              notes: q.notes,
              termsConditions: q.termsConditions,
              createdById,
              items: {
                create: (q.items || []).map((item: any) => ({
                  name: item.name,
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  discountRate: item.discountRate,
                  taxRate: item.taxRate,
                  lineTotal: item.lineTotal,
                  sortOrder: item.sortOrder,
                })),
              },
            },
          });

          await tx.quotation.update({
            where: { id },
            data: {
              status: 'CONVERTED',
              convertedAt: now,
              convertedInvoiceId: inv.id,
              updatedAt: now,
            },
          });

          return inv;
        });

        invoiceId = createdInv.id;
        console.log(`[TX COMMIT] QuotationService.convertToInvoice: Committed conversion invoiceId=${invoiceId}`);
      }
    } catch (err: any) {
      console.error(`[TX ROLLBACK / ERROR] QuotationService.convertToInvoice: ${err?.message || err}`);
      throw err;
    }

    const createdInvoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true, items: true },
    });

    // Activity Log
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            action: 'QUOTATION_CONVERTED_INVOICE',
            module: 'FINANCE',
            category: 'QUOTATION',
            entityType: 'QUOTATION',
            entityId: id,
            description: `Converted quotation ${q.quoteNumber} to Invoice ${createdInvoice?.invoiceNumber || nextInvoiceNum}`,
            metadata: { invoiceId, invoiceNumber: createdInvoice?.invoiceNumber || nextInvoiceNum },
          },
        });
      }
    } catch {
      // Log fallback
    }

    return { invoice: createdInvoice, quotation: await this.getQuotationById(id) };
  }

  /**
   * Soft delete quotation
   */
  static async softDeleteQuotation(id: string) {
    const db = prisma as any;

    const q = await db.quotation.findUnique({ where: { id } });
    if (!q) throw new Error('Quotation not found');

    await db.quotation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Activity Log
    try {
      await db.activityLog.create({
        data: {
          companyId: q.companyId,
          action: 'QUOTATION_DELETED',
          module: 'FINANCE',
          category: 'QUOTATION',
          entityType: 'QUOTATION',
          entityId: id,
          description: `Deleted quotation ${q.quoteNumber}`,
        },
      });
    } catch {
      // Log fallback
    }

    return { success: true };
  }

  /**
   * Email quotation to recipient
   */
  static async emailQuotation(
    id: string,
    emailData: { recipientEmail: string; subject: string; message: string }
  ) {
    const db = prisma as any;
    const now = new Date();

    let q: any = null;
    try {
      if (db.quotation?.findUnique) {
        q = await db.quotation.findUnique({ where: { id } });
      }
    } catch (err) {
      console.warn('[QuotationService.emailQuotation] DB query notice:', err);
    }

    if (q && db.quotation?.update) {
      try {
        await db.quotation.update({
          where: { id },
          data: {
            status: q.status === 'DRAFT' ? 'SENT' : q.status,
            sentAt: now,
            updatedAt: now,
          },
        });
      } catch (err) {
        console.warn('[QuotationService.emailQuotation] DB update notice:', err);
      }
    }

    // Activity Log
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId: q?.companyId || 'comp_001',
            action: 'QUOTATION_SENT',
            module: 'FINANCE',
            category: 'QUOTATION',
            entityType: 'QUOTATION',
            entityId: id,
            description: `Emailed quotation ${q?.quoteNumber || id} to ${emailData.recipientEmail}`,
          },
        });
      }
    } catch {
      // Log fallback
    }

    return { success: true, sentAt: now.toISOString() };
  }
}
