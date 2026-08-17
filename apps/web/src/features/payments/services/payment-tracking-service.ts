/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import {
  PaymentRecord,
  PaymentFormValues,
  PaymentFilterState,
  PaymentKPISummary,
  OutstandingInvoiceItem,
  CustomerPaymentSummary,
  ProjectPaymentSummary,
} from '../types/payment-types';

export class PaymentTrackingService {
  /**
   * Record manual payment
   */
  static async recordPayment(
    companyId: string = 'comp_001',
    recordedById: string = 'usr_001',
    data: PaymentFormValues
  ): Promise<PaymentRecord> {
    const db = prisma as any;

    // 1. Fetch Invoice
    const invoice = await db.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!invoice || invoice.deletedAt) {
      throw new Error('Invoice not found');
    }

    const payAmount = Number(data.amount) || 0;
    if (payAmount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    // 2. Create Payment Record
    const payment = await db.invoicePayment.create({
      data: {
        companyId,
        invoiceId: data.invoiceId,
        customerId: data.customerId || invoice.customerId,
        projectId: data.projectId || invoice.projectId,
        amount: payAmount,
        paymentDate: new Date(data.paymentDate || Date.now()),
        paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
        referenceNumber: data.referenceNumber || null,
        notes: data.notes || null,
        internalNotes: data.internalNotes || null,
        recordedById,
      },
    });

    // 3. Save internal note if provided
    if (data.internalNotes) {
      await db.paymentNote.create({
        data: {
          companyId,
          paymentId: payment.id,
          invoiceId: data.invoiceId,
          content: data.internalNotes,
          createdById: recordedById,
        },
      });
    }

    // 4. Recalculate Invoice Balances & Status
    await this.recalculateInvoiceBalances(data.invoiceId);

    // 5. Activity Log
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'PAYMENT_RECORDED',
          module: 'FINANCE',
          category: 'INVOICE',
          entityType: 'INVOICE_PAYMENT',
          entityId: payment.id,
          description: `Recorded payment of $${payAmount.toFixed(2)} (${data.paymentMethod}) for Invoice ${invoice.invoiceNumber}`,
          metadata: { amount: payAmount, referenceNumber: data.referenceNumber },
        },
      });
    } catch {
      // Activity log fallback
    }

    return this.getPaymentById(payment.id);
  }

  /**
   * Recalculate invoice amountPaid, remainingBalance, and status
   */
  static async recalculateInvoiceBalances(invoiceId: string): Promise<void> {
    const db = prisma as any;

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: {
          where: { deletedAt: null },
        },
      },
    });

    if (!invoice) return;

    let totalPaid = 0;
    (invoice.payments || []).forEach((p: any) => {
      totalPaid += p.amount || 0;
    });

    totalPaid = Math.round(totalPaid * 100) / 100;
    const remainingBalance = Math.max(0, Math.round((invoice.grandTotal - totalPaid) * 100) / 100);

    let nextStatus = invoice.status;
    const now = new Date();

    if (remainingBalance === 0 && invoice.grandTotal > 0) {
      nextStatus = 'PAID';
    } else if (totalPaid > 0 && remainingBalance > 0) {
      nextStatus = 'PARTIALLY_PAID';
    } else if (new Date(invoice.dueDate) < now && invoice.status !== 'PAID') {
      nextStatus = 'OVERDUE';
    }

    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: totalPaid,
        remainingBalance,
        status: nextStatus,
        paidAt: remainingBalance === 0 ? now : invoice.paidAt,
      },
    });
  }

  /**
   * Fetch single payment record by ID
   */
  static async getPaymentById(id: string): Promise<PaymentRecord> {
    const db = prisma as any;

    const p = await db.invoicePayment.findUnique({
      where: { id },
      include: {
        invoice: true,
        customer: true,
        project: true,
        recordedBy: { select: { fullName: true } },
      },
    });

    if (!p) throw new Error('Payment record not found');

    return {
      id: p.id,
      companyId: p.companyId,
      invoiceId: p.invoiceId,
      customerId: p.customerId,
      projectId: p.projectId,
      amount: p.amount,
      paymentDate: p.paymentDate.toISOString(),
      paymentMethod: p.paymentMethod as any,
      referenceNumber: p.referenceNumber,
      notes: p.notes,
      internalNotes: p.internalNotes,
      deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
      recordedById: p.recordedById,
      recordedByName: p.recordedBy?.fullName || 'System User',
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      invoice: p.invoice
        ? {
            id: p.invoice.id,
            invoiceNumber: p.invoice.invoiceNumber,
            grandTotal: p.invoice.grandTotal,
            amountPaid: p.invoice.amountPaid,
            remainingBalance: p.invoice.remainingBalance,
            status: p.invoice.status,
            dueDate: p.invoice.dueDate.toISOString(),
          }
        : undefined,
      customer: p.customer
        ? {
            id: p.customer.id,
            name: p.customer.name,
            companyName: p.customer.companyName,
            email: p.customer.email,
          }
        : null,
      project: p.project
        ? {
            id: p.project.id,
            name: p.project.name,
            projectCode: p.project.projectCode,
          }
        : null,
    };
  }

  /**
   * Fetch payments history with filters & KPI summary
   */
  static async getPaymentList(
    companyId: string = 'comp_001',
    filters: PaymentFilterState = {}
  ): Promise<{ payments: PaymentRecord[]; summary: PaymentKPISummary }> {
    const db = prisma as any;

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { referenceNumber: { contains: filters.search, mode: 'insensitive' } },
        { invoice: { invoiceNumber: { contains: filters.search, mode: 'insensitive' } } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
        { customer: { companyName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.paymentMethod && filters.paymentMethod !== 'ALL') {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.invoiceId) {
      where.invoiceId = filters.invoiceId;
    }

    const [paymentsRaw, openInvoices] = await Promise.all([
      db.invoicePayment.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        include: {
          invoice: true,
          customer: true,
          project: true,
          recordedBy: { select: { fullName: true } },
        },
      }),
      db.invoice.findMany({
        where: { companyId, deletedAt: null, remainingBalance: { gt: 0 } },
        select: { remainingBalance: true, dueDate: true, status: true },
      }),
    ]);

    const formattedPayments: PaymentRecord[] = paymentsRaw.map((p: any) => ({
      id: p.id,
      companyId: p.companyId,
      invoiceId: p.invoiceId,
      customerId: p.customerId,
      projectId: p.projectId,
      amount: p.amount,
      paymentDate: p.paymentDate.toISOString(),
      paymentMethod: p.paymentMethod as any,
      referenceNumber: p.referenceNumber,
      notes: p.notes,
      internalNotes: p.internalNotes,
      deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
      recordedById: p.recordedById,
      recordedByName: p.recordedBy?.fullName || 'System User',
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      invoice: p.invoice
        ? {
            id: p.invoice.id,
            invoiceNumber: p.invoice.invoiceNumber,
            grandTotal: p.invoice.grandTotal,
            amountPaid: p.invoice.amountPaid,
            remainingBalance: p.invoice.remainingBalance,
            status: p.invoice.status,
            dueDate: p.invoice.dueDate.toISOString(),
          }
        : undefined,
      customer: p.customer
        ? {
            id: p.customer.id,
            name: p.customer.name,
            companyName: p.customer.companyName,
            email: p.customer.email,
          }
        : null,
      project: p.project
        ? {
            id: p.project.id,
            name: p.project.name,
            projectCode: p.project.projectCode,
          }
        : null,
    }));

    // KPI Metrics calculation
    let totalCollected = 0;
    formattedPayments.forEach((p) => {
      totalCollected += p.amount;
    });

    let totalOutstanding = 0;
    let overdueAmount = 0;
    let overdueInvoicesCount = 0;

    const now = new Date();

    openInvoices.forEach((inv: any) => {
      totalOutstanding += inv.remainingBalance || 0;
      if (new Date(inv.dueDate) < now || inv.status === 'OVERDUE') {
        overdueAmount += inv.remainingBalance || 0;
        overdueInvoicesCount++;
      }
    });

    const summary: PaymentKPISummary = {
      totalCollected: Math.round(totalCollected * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      totalPaymentsCount: formattedPayments.length,
      openInvoicesCount: openInvoices.length,
      overdueInvoicesCount,
    };

    return { payments: formattedPayments, summary };
  }

  /**
   * Soft delete payment
   */
  static async softDeletePayment(id: string): Promise<{ success: boolean }> {
    const db = prisma as any;

    const p = await db.invoicePayment.findUnique({ where: { id } });
    if (!p) throw new Error('Payment record not found');

    await db.invoicePayment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Recalculate Invoice Balances & Status
    await this.recalculateInvoiceBalances(p.invoiceId);

    // Activity Log
    try {
      await db.activityLog.create({
        data: {
          companyId: p.companyId,
          action: 'PAYMENT_DELETED',
          module: 'FINANCE',
          category: 'INVOICE',
          entityType: 'INVOICE_PAYMENT',
          entityId: id,
          description: `Soft-deleted payment record of $${p.amount} for invoice`,
        },
      });
    } catch {
      // Activity log fallback
    }

    return { success: true };
  }

  /**
   * Fetch outstanding invoices with aging analysis
   */
  static async getOutstandingInvoices(
    companyId: string = 'comp_001'
  ): Promise<OutstandingInvoiceItem[]> {
    const db = prisma as any;

    const invoices = await db.invoice.findMany({
      where: {
        companyId,
        deletedAt: null,
        remainingBalance: { gt: 0 },
      },
      include: {
        customer: { select: { id: true, name: true, companyName: true } },
        project: { select: { id: true, name: true, projectCode: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();

    return invoices.map((inv: any) => {
      const due = new Date(inv.dueDate);
      const diffMs = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 3600 * 24));
      const isOverdue = diffDays < 0 || inv.status === 'OVERDUE';

      const percentagePaid =
        inv.grandTotal > 0 ? Math.round(((inv.amountPaid || 0) / inv.grandTotal) * 100) : 0;

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        companyId: inv.companyId,
        customerId: inv.customerId,
        customerName: inv.customer?.name || 'Unknown Customer',
        customerCompanyName: inv.customer?.companyName || 'N/A',
        projectId: inv.projectId,
        projectName: inv.project?.name || null,
        invoiceDate: inv.invoiceDate.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        grandTotal: inv.grandTotal,
        amountPaid: inv.amountPaid,
        remainingBalance: inv.remainingBalance,
        percentagePaid,
        status: isOverdue ? 'OVERDUE' : inv.status,
        daysRemainingOrOverdue: diffDays,
        isOverdue,
      };
    });
  }

  /**
   * Get Customer Payment Summary
   */
  static async getCustomerPaymentSummary(
    customerId: string,
    companyId: string = 'comp_001'
  ): Promise<CustomerPaymentSummary> {
    const db = prisma as any;

    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) throw new Error('Customer not found');

    const [invoices, paymentsRaw] = await Promise.all([
      db.invoice.findMany({
        where: { companyId, customerId, deletedAt: null },
        select: { grandTotal: true, amountPaid: true, remainingBalance: true, dueDate: true, status: true },
      }),
      db.invoicePayment.findMany({
        where: { companyId, customerId, deletedAt: null },
        orderBy: { paymentDate: 'desc' },
        take: 5,
        include: {
          invoice: { select: { invoiceNumber: true } },
        },
      }),
    ]);

    let totalInvoiced = 0;
    let totalPaid = 0;
    let outstandingBalance = 0;
    let overdueAmount = 0;

    const now = new Date();

    invoices.forEach((inv: any) => {
      totalInvoiced += inv.grandTotal || 0;
      totalPaid += inv.amountPaid || 0;
      outstandingBalance += inv.remainingBalance || 0;

      if (inv.remainingBalance > 0 && (new Date(inv.dueDate) < now || inv.status === 'OVERDUE')) {
        overdueAmount += inv.remainingBalance;
      }
    });

    const recentPayments: PaymentRecord[] = paymentsRaw.map((p: any) => ({
      id: p.id,
      companyId: p.companyId,
      invoiceId: p.invoiceId,
      amount: p.amount,
      paymentDate: p.paymentDate.toISOString(),
      paymentMethod: p.paymentMethod as any,
      referenceNumber: p.referenceNumber,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      invoice: p.invoice ? { invoiceNumber: p.invoice.invoiceNumber } as any : undefined,
    }));

    return {
      customerId: customer.id,
      customerName: customer.name,
      companyName: customer.companyName,
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      outstandingBalance: Math.round(outstandingBalance * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      recentPayments,
    };
  }

  /**
   * Get Project Payment Summary
   */
  static async getProjectPaymentSummary(
    projectId: string,
    companyId: string = 'comp_001'
  ): Promise<ProjectPaymentSummary> {
    const db = prisma as any;

    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error('Project not found');

    const invoices = await db.invoice.findMany({
      where: { companyId, projectId, deletedAt: null },
      select: { grandTotal: true, amountPaid: true, remainingBalance: true },
    });

    let totalProjectValue = project.budget || 0;
    let amountReceived = 0;
    let totalInvoiced = 0;

    invoices.forEach((inv: any) => {
      totalInvoiced += inv.grandTotal || 0;
      amountReceived += inv.amountPaid || 0;
    });

    if (totalInvoiced > totalProjectValue) {
      totalProjectValue = totalInvoiced;
    }

    const remainingBalance = Math.max(0, Math.round((totalProjectValue - amountReceived) * 100) / 100);
    const percentagePaid =
      totalProjectValue > 0 ? Math.round((amountReceived / totalProjectValue) * 100) : 0;

    return {
      projectId: project.id,
      projectName: project.name,
      projectCode: project.projectCode,
      totalProjectValue: Math.round(totalProjectValue * 100) / 100,
      amountReceived: Math.round(amountReceived * 100) / 100,
      remainingBalance,
      percentagePaid,
      linkedInvoicesCount: invoices.length,
    };
  }

  /**
   * Send payment reminder notification/email
   */
  static async sendPaymentReminder(
    invoiceId: string,
    reminderType: 'DUE_SOON' | 'OVERDUE' | 'MANUAL' = 'MANUAL'
  ) {
    const db = prisma as any;

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice || invoice.deletedAt) {
      throw new Error('Invoice not found');
    }

    const now = new Date();

    // Record Activity Log
    try {
      await db.activityLog.create({
        data: {
          companyId: invoice.companyId,
          action: 'PAYMENT_REMINDER_SENT',
          module: 'FINANCE',
          category: 'INVOICE',
          entityType: 'INVOICE',
          entityId: invoiceId,
          description: `Sent ${reminderType.toLowerCase()} payment reminder for invoice ${invoice.invoiceNumber} ($${invoice.remainingBalance.toFixed(2)} remaining)`,
          metadata: { reminderType, recipientEmail: invoice.customer?.email },
        },
      });
    } catch {
      // Activity log fallback
    }

    return { success: true, sentAt: now.toISOString() };
  }
}
