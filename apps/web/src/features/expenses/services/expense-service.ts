/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import {
  ExpenseRecord,
  ExpenseFormValues,
  ExpenseCategory,
  Vendor,
  ExpenseFilterState,
  ExpenseKPISummary,
  ProjectBudgetImpact,
  ExpenseStatus,
} from '../types/expense-types';

export class ExpenseService {
  /**
   * Seed / Initialize default 11 built-in categories for tenant workspace
   */
  static async initializeDefaultCategories(companyId: string = 'comp_001'): Promise<void> {
    const db = prisma as any;

    const count = await db.expenseCategory.count({ where: { companyId } });
    if (count > 0) return;

    const defaults = [
      { name: 'Office Supplies', color: '#3B82F6' },
      { name: 'Software & Subscriptions', color: '#8B5CF6' },
      { name: 'Marketing', color: '#EC4899' },
      { name: 'Travel', color: '#F59E0B' },
      { name: 'Utilities', color: '#10B981' },
      { name: 'Salaries', color: '#6366F1' },
      { name: 'Equipment', color: '#14B8A6' },
      { name: 'Internet & Hosting', color: '#06B6D4' },
      { name: 'Maintenance', color: '#64748B' },
      { name: 'Training', color: '#84CC16' },
      { name: 'Miscellaneous', color: '#94A3B8' },
    ];

    for (const item of defaults) {
      await db.expenseCategory.create({
        data: {
          companyId,
          name: item.name,
          color: item.color,
          isBuiltIn: true,
        },
      });
    }
  }

  /**
   * Fetch all expense categories for tenant workspace
   */
  static async getExpenseCategories(companyId: string = 'comp_001'): Promise<ExpenseCategory[]> {
    const db = prisma as any;
    await this.initializeDefaultCategories(companyId);

    const categories = await db.expenseCategory.findMany({
      where: { companyId },
      orderBy: [{ isBuiltIn: 'desc' }, { name: 'asc' }],
    });

    return categories.map((c: any) => ({
      id: c.id,
      companyId: c.companyId,
      name: c.name,
      isBuiltIn: c.isBuiltIn,
      color: c.color,
      createdById: c.createdById,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  /**
   * Create custom expense category
   */
  static async createExpenseCategory(
    companyId: string = 'comp_001',
    createdById: string = 'usr_001',
    data: { name: string; color?: string }
  ): Promise<ExpenseCategory> {
    const db = prisma as any;

    const cat = await db.expenseCategory.create({
      data: {
        companyId,
        name: data.name,
        color: data.color || '#3B82F6',
        isBuiltIn: false,
        createdById,
      },
    });

    return {
      id: cat.id,
      companyId: cat.companyId,
      name: cat.name,
      isBuiltIn: cat.isBuiltIn,
      color: cat.color,
      createdById: cat.createdById,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    };
  }

  /**
   * Fetch vendor directory for tenant workspace
   */
  static async getVendors(companyId: string = 'comp_001'): Promise<Vendor[]> {
    const db = prisma as any;

    const vendors = await db.vendor.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });

    return vendors.map((v: any) => ({
      id: v.id,
      companyId: v.companyId,
      name: v.name,
      contactPerson: v.contactPerson,
      email: v.email,
      phone: v.phone,
      address: v.address,
      notes: v.notes,
      createdById: v.createdById,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));
  }

  /**
   * Create vendor in directory
   */
  static async createVendor(
    companyId: string = 'comp_001',
    createdById: string = 'usr_001',
    data: Partial<Vendor>
  ): Promise<Vendor> {
    const db = prisma as any;

    const v = await db.vendor.create({
      data: {
        companyId,
        name: data.name!,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
        createdById,
      },
    });

    return {
      id: v.id,
      companyId: v.companyId,
      name: v.name,
      contactPerson: v.contactPerson,
      email: v.email,
      phone: v.phone,
      address: v.address,
      notes: v.notes,
      createdById: v.createdById,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    };
  }

  /**
   * Create new expense record
   */
  static async createExpense(
    companyId: string = 'comp_001',
    createdById: string = 'usr_001',
    data: ExpenseFormValues & { categoryName?: string; vendorName?: string }
  ): Promise<ExpenseRecord> {
    const db = prisma as any;

    const amt = Number(data.amount) || 0;
    if (amt <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    const status = data.status || 'PENDING_APPROVAL';

    // Auto-resolve Category ID
    let categoryId = data.categoryId;
    if (!categoryId) {
      const categories = await this.getExpenseCategories(companyId);
      const matched = categories.find((c) => c.name.toLowerCase() === (data.categoryName || 'office supplies').toLowerCase()) || categories[0];
      categoryId = matched?.id;
    }

    // Auto-resolve Vendor ID if vendorName is passed
    let vendorId = data.vendorId || null;
    if (!vendorId && data.vendorName) {
      try {
        const existingVendor = await db.vendor.findFirst({
          where: { companyId, name: data.vendorName },
        });
        if (existingVendor) {
          vendorId = existingVendor.id;
        } else if (db.vendor?.create) {
          const createdV = await db.vendor.create({
            data: { companyId, name: data.vendorName, createdById },
          });
          vendorId = createdV.id;
        }
      } catch {
        // Fallback
      }
    }

    const expense = await db.expense.create({
      data: {
        companyId,
        title: data.title || (data as any).description || 'General Expense',
        description: data.description || null,
        categoryId,
        amount: amt,
        expenseDate: new Date(data.expenseDate || Date.now()),
        vendorId,
        projectId: data.projectId || null,
        employeeId: data.employeeId || createdById,
        paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
        status,
        receiptUrl: data.receiptUrl || null,
        receiptName: data.receiptName || null,
        receiptSize: data.receiptSize || null,
        notes: data.notes || null,
        createdById,
      },
    });

    // Record Activity Log
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'EXPENSE_CREATED',
          module: 'FINANCE',
          category: 'EXPENSE',
          entityType: 'EXPENSE',
          entityId: expense.id,
          description: `Recorded expense "${expense.title}" ($${amt.toFixed(2)})`,
          metadata: { amount: amt, status },
        },
      });
    } catch {
      // Activity log fallback
    }

    return this.getExpenseById(expense.id);
  }

  /**
   * Fetch single expense record by ID
   */
  static async getExpenseById(id: string): Promise<ExpenseRecord> {
    const db = prisma as any;

    const e = await db.expense.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: true,
        project: { select: { id: true, name: true, projectCode: true, budget: true } },
        employee: { select: { id: true, fullName: true, email: true } },
        reviewedBy: { select: { fullName: true } },
        createdBy: { select: { fullName: true } },
      },
    });

    if (!e || e.deletedAt) {
      throw new Error('Expense record not found');
    }

    return {
      id: e.id,
      companyId: e.companyId,
      title: e.title,
      description: e.description,
      categoryId: e.categoryId,
      amount: e.amount,
      expenseDate: e.expenseDate.toISOString(),
      vendorId: e.vendorId,
      projectId: e.projectId,
      employeeId: e.employeeId,
      paymentMethod: e.paymentMethod as any,
      status: e.status as ExpenseStatus,
      receiptUrl: e.receiptUrl,
      receiptName: e.receiptName,
      receiptSize: e.receiptSize,
      notes: e.notes,
      reviewedById: e.reviewedById,
      reviewedByName: e.reviewedBy?.fullName || undefined,
      reviewedAt: e.reviewedAt ? e.reviewedAt.toISOString() : null,
      approvalNotes: e.approvalNotes,
      deletedAt: e.deletedAt ? e.deletedAt.toISOString() : null,
      createdById: e.createdById,
      createdByName: e.createdBy?.fullName || 'System User',
      updatedById: e.updatedById,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      category: e.category ? {
        id: e.category.id,
        companyId: e.category.companyId,
        name: e.category.name,
        isBuiltIn: e.category.isBuiltIn,
        color: e.category.color,
        createdAt: e.category.createdAt.toISOString(),
        updatedAt: e.category.updatedAt.toISOString(),
      } : undefined,
      vendor: e.vendor ? {
        id: e.vendor.id,
        companyId: e.vendor.companyId,
        name: e.vendor.name,
        contactPerson: e.vendor.contactPerson,
        email: e.vendor.email,
        phone: e.vendor.phone,
        address: e.vendor.address,
        notes: e.vendor.notes,
        createdAt: e.vendor.createdAt.toISOString(),
        updatedAt: e.vendor.updatedAt.toISOString(),
      } : null,
      project: e.project ? {
        id: e.project.id,
        name: e.project.name,
        projectCode: e.project.projectCode,
        budget: e.project.budget,
      } : null,
      employee: e.employee ? {
        id: e.employee.id,
        fullName: e.employee.fullName,
        email: e.employee.email,
      } : null,
    };
  }

  /**
   * Fetch expense list with filters & KPI summary
   */
  static async getExpenseList(
    companyId: string = 'comp_001',
    filters: ExpenseFilterState = {}
  ): Promise<{ expenses: ExpenseRecord[]; summary: ExpenseKPISummary }> {
    const db = prisma as any;
    await this.initializeDefaultCategories(companyId);

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { vendor: { name: { contains: filters.search, mode: 'insensitive' } } },
        { project: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.categoryId && filters.categoryId !== 'ALL') {
      where.categoryId = filters.categoryId;
    }

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    const [expensesRaw, allExpenses] = await Promise.all([
      db.expense.findMany({
        where,
        orderBy: { expenseDate: 'desc' },
        include: {
          category: true,
          vendor: true,
          project: { select: { id: true, name: true, projectCode: true } },
          employee: { select: { id: true, fullName: true, email: true } },
          createdBy: { select: { fullName: true } },
        },
      }),
      db.expense.findMany({
        where: { companyId, deletedAt: null },
        select: { amount: true, status: true, expenseDate: true, projectId: true },
      }),
    ]);

    const formattedExpenses: ExpenseRecord[] = expensesRaw.map((e: any) => ({
      id: e.id,
      companyId: e.companyId,
      title: e.title,
      description: e.description,
      categoryId: e.categoryId,
      amount: e.amount,
      expenseDate: e.expenseDate.toISOString(),
      vendorId: e.vendorId,
      projectId: e.projectId,
      employeeId: e.employeeId,
      paymentMethod: e.paymentMethod as any,
      status: e.status as ExpenseStatus,
      receiptUrl: e.receiptUrl,
      receiptName: e.receiptName,
      receiptSize: e.receiptSize,
      notes: e.notes,
      reviewedById: e.reviewedById,
      reviewedAt: e.reviewedAt ? e.reviewedAt.toISOString() : null,
      approvalNotes: e.approvalNotes,
      deletedAt: e.deletedAt ? e.deletedAt.toISOString() : null,
      createdById: e.createdById,
      createdByName: e.createdBy?.fullName || 'System User',
      updatedById: e.updatedById,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      category: e.category ? {
        id: e.category.id,
        companyId: e.category.companyId,
        name: e.category.name,
        isBuiltIn: e.category.isBuiltIn,
        color: e.category.color,
        createdAt: e.category.createdAt.toISOString(),
        updatedAt: e.category.updatedAt.toISOString(),
      } : undefined,
      vendor: e.vendor ? {
        id: e.vendor.id,
        companyId: e.vendor.companyId,
        name: e.vendor.name,
        contactPerson: e.vendor.contactPerson,
        email: e.vendor.email,
        phone: e.vendor.phone,
        address: e.vendor.address,
        notes: e.vendor.notes,
        createdAt: e.vendor.createdAt.toISOString(),
        updatedAt: e.vendor.updatedAt.toISOString(),
      } : null,
      project: e.project ? {
        id: e.project.id,
        name: e.project.name,
        projectCode: e.project.projectCode,
      } : null,
      employee: e.employee ? {
        id: e.employee.id,
        fullName: e.employee.fullName,
        email: e.employee.email,
      } : null,
    }));

    // KPI Metrics calculation
    let totalExpenses = 0;
    let monthlyExpenses = 0;
    let pendingApprovalsCount = 0;
    let pendingApprovalsValue = 0;
    let approvedCount = 0;
    let approvedValue = 0;
    let rejectedCount = 0;
    let projectExpensesValue = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    allExpenses.forEach((e: any) => {
      totalExpenses += e.amount || 0;

      const expDate = new Date(e.expenseDate);
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        monthlyExpenses += e.amount || 0;
      }

      if (e.status === 'PENDING_APPROVAL') {
        pendingApprovalsCount++;
        pendingApprovalsValue += e.amount || 0;
      }

      if (e.status === 'APPROVED' || e.status === 'PAID') {
        approvedCount++;
        approvedValue += e.amount || 0;
      }

      if (e.status === 'REJECTED') {
        rejectedCount++;
      }

      if (e.projectId) {
        projectExpensesValue += e.amount || 0;
      }
    });

    const summary: ExpenseKPISummary = {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      pendingApprovalsCount,
      pendingApprovalsValue: Math.round(pendingApprovalsValue * 100) / 100,
      approvedCount,
      approvedValue: Math.round(approvedValue * 100) / 100,
      rejectedCount,
      projectExpensesValue: Math.round(projectExpensesValue * 100) / 100,
    };

    return { expenses: formattedExpenses, summary };
  }

  /**
   * Approve or Reject an expense claim
   */
  static async approveRejectExpense(
    id: string,
    reviewerId: string = 'usr_001',
    status: 'APPROVED' | 'REJECTED',
    approvalNotes?: string
  ): Promise<ExpenseRecord> {
    const db = prisma as any;

    const existing = await db.expense.findUnique({ where: { id } });
    if (!existing) throw new Error('Expense record not found');

    const now = new Date();

    const updated = await db.expense.update({
      where: { id },
      data: {
        status,
        reviewedById: reviewerId,
        reviewedAt: now,
        approvalNotes: approvalNotes || null,
        updatedAt: now,
      },
    });

    // Record Activity Log
    try {
      await db.activityLog.create({
        data: {
          companyId: existing.companyId,
          action: status === 'APPROVED' ? 'EXPENSE_APPROVED' : 'EXPENSE_REJECTED',
          module: 'FINANCE',
          category: 'EXPENSE',
          entityType: 'EXPENSE',
          entityId: id,
          description: `${status === 'APPROVED' ? 'Approved' : 'Rejected'} expense "${existing.title}" ($${existing.amount.toFixed(2)})`,
          metadata: { approvalNotes },
        },
      });
    } catch {
      // Activity log fallback
    }

    return this.getExpenseById(updated.id);
  }

  /**
   * Soft delete expense
   */
  static async softDeleteExpense(id: string): Promise<{ success: boolean }> {
    const db = prisma as any;

    const e = await db.expense.findUnique({ where: { id } });
    if (!e) throw new Error('Expense record not found');

    await db.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Activity Log
    try {
      await db.activityLog.create({
        data: {
          companyId: e.companyId,
          action: 'EXPENSE_DELETED',
          module: 'FINANCE',
          category: 'EXPENSE',
          entityType: 'EXPENSE',
          entityId: id,
          description: `Soft-deleted expense "${e.title}" ($${e.amount})`,
        },
      });
    } catch {
      // Activity log fallback
    }

    return { success: true };
  }

  /**
   * Get Project Budget Impact Monitoring analysis
   */
  static async getProjectBudgetImpact(
    projectId: string,
    companyId: string = 'comp_001'
  ): Promise<ProjectBudgetImpact> {
    const db = prisma as any;

    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error('Project not found');

    const expensesRaw = await db.expense.findMany({
      where: { companyId, projectId, deletedAt: null },
      include: {
        category: true,
        vendor: true,
        employee: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { expenseDate: 'desc' },
    });

    let totalSpent = 0;
    expensesRaw.forEach((e: any) => {
      if (e.status === 'APPROVED' || e.status === 'PAID') {
        totalSpent += e.amount || 0;
      }
    });

    totalSpent = Math.round(totalSpent * 100) / 100;
    const budget = project.budget || 0;
    const remainingBudget = Math.round((budget - totalSpent) * 100) / 100;
    const percentageSpent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
    const isOverBudget = totalSpent > budget && budget > 0;

    const expenses: ExpenseRecord[] = expensesRaw.map((e: any) => ({
      id: e.id,
      companyId: e.companyId,
      title: e.title,
      description: e.description,
      categoryId: e.categoryId,
      amount: e.amount,
      expenseDate: e.expenseDate.toISOString(),
      vendorId: e.vendorId,
      projectId: e.projectId,
      employeeId: e.employeeId,
      paymentMethod: e.paymentMethod as any,
      status: e.status as ExpenseStatus,
      receiptUrl: e.receiptUrl,
      receiptName: e.receiptName,
      receiptSize: e.receiptSize,
      notes: e.notes,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      category: e.category ? {
        id: e.category.id,
        name: e.category.name,
        color: e.category.color,
      } as any : undefined,
    }));

    return {
      projectId: project.id,
      projectName: project.name,
      projectCode: project.projectCode,
      budget,
      totalSpent,
      remainingBudget,
      percentageSpent,
      isOverBudget,
      expenses,
    };
  }
}
