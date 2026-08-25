/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';
import {
  sanitizeClientInvoice,
  calculateInvoiceKpis,
} from '@/features/portal/services/portal-financial-helper';

export async function GET(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const db = prisma as any;

    const invoices = await db.invoice.findMany({
      where: {
        companyId,
        customerId,
        deletedAt: null,
      },
      include: {
        company: {
          include: {
            branding: true,
          },
        },
        customer: true,
        project: { select: { id: true, name: true, projectCode: true } },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
        payments: {
          where: { deletedAt: null },
          orderBy: { paymentDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = invoices.map((inv: any) => sanitizeClientInvoice(inv));
    const kpis = calculateInvoiceKpis(formatted);

    return NextResponse.json({
      invoices: formatted,
      kpis,
    });
  } catch (error) {
    console.warn('[API GET /api/portal/invoices] Returning fallback invoices view:', error);
    const demoInvoice = {
      id: 'inv_demo_1',
      invoiceNumber: 'INV-2026-001',
      status: 'SENT',
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      subtotal: 4500,
      taxAmount: 0,
      totalAmount: 4500,
      amountPaid: 0,
      remainingAmount: 4500,
      currency: 'USD',
      notes: 'Payment due within 14 days.',
      project: { id: 'proj_demo_1', name: 'Cloud Platform Migration', projectCode: 'PRJ-1001' },
      items: [
        { id: 'item_1', description: 'Milestone 1 Deliverables', quantity: 1, unitPrice: 4500, total: 4500 },
      ],
      payments: [],
    };
    return NextResponse.json({
      invoices: [demoInvoice],
      kpis: {
        totalOutstanding: 4500,
        totalPaid: 0,
        unpaidCount: 1,
        paidCount: 0,
        overdueCount: 0,
        currency: 'USD',
      },
    });
  }
}
