import { logger } from '@/lib/logger';

export interface ActivityLogInput {
  companyId: string;
  userId?: string;
  action: string;
  module: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export class ActivityLoggerService {
  static async log(input: ActivityLogInput): Promise<void> {
    const timestamp = new Date().toISOString();

    // Log structured audit payload
    logger.info({
      type: 'AUDIT_LOG',
      action: input.action,
      module: input.module,
      companyId: input.companyId,
      userId: input.userId || 'SYSTEM',
      metadata: input.metadata,
      timestamp,
    }, `[AUDIT] ${input.action} in ${input.module}: ${input.description}`);
  }

  static logCustomerCreated(companyId: string, customerId: string, name: string, userId?: string) {
    return this.log({
      companyId,
      userId,
      action: 'CUSTOMER_CREATED',
      module: 'CRM',
      description: `Customer "${name}" created.`,
      metadata: { customerId, name },
    });
  }

  static logInvoiceGenerated(companyId: string, invoiceId: string, amount: number, userId?: string) {
    return this.log({
      companyId,
      userId,
      action: 'INVOICE_GENERATED',
      module: 'FINANCE',
      description: `Invoice #${invoiceId} generated for $${amount}.`,
      metadata: { invoiceId, amount },
    });
  }

  static logAttendanceCheckedIn(companyId: string, employeeName: string, userId?: string) {
    return this.log({
      companyId,
      userId,
      action: 'ATTENDANCE_CHECKED_IN',
      module: 'ATTENDANCE',
      description: `Employee ${employeeName} checked in.`,
      metadata: { employeeName },
    });
  }
}
