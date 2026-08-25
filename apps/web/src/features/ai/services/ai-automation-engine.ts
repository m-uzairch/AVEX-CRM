import { CRMContextService } from './crm-context-service';
import {
  AIAutomationItem,
  AutomationSummaryKPIs,
} from '../schemas/ai-automation-schemas';

export const memoryAutomationQueue: Record<string, AIAutomationItem[]> = {};

export class AIAutomationEngine {
  /**
   * Scans company CRM data and generates pending automation proposals
   */
  static async scanAndGenerate(companyId: string): Promise<AIAutomationItem[]> {
    const ctx = await CRMContextService.buildContextSnapshot(companyId);

    if (!memoryAutomationQueue[companyId]) {
      memoryAutomationQueue[companyId] = [];
    }

    const currentQueue = memoryAutomationQueue[companyId];
    const generated: AIAutomationItem[] = [];

    // 1. Trigger: Overdue Invoices
    if (ctx.finance.totalOverdueInvoices > 0) {
      for (const inv of ctx.finance.overdueList) {
        const autoId = `auto_inv_${inv.id}_${companyId}`;
        const existing = currentQueue.find((a) => a.id === autoId);

        if (!existing) {
          const item: AIAutomationItem = {
            id: autoId,
            companyId,
            triggerType: 'INVOICE_OVERDUE',
            actionType: 'SEND_EMAIL_REMINDER',
            title: `Payment Reminder: Invoice ${inv.invoiceNumber}`,
            description: `Invoice ${inv.invoiceNumber} for ${inv.customerName} ($${inv.amount.toLocaleString()}) was due on ${inv.dueDate}.`,
            urgency: 'CRITICAL',
            entityId: inv.id,
            entityType: 'INVOICE',
            status: 'PENDING_APPROVAL',
            preparedPayload: {
              recipientName: inv.customerName,
              recipientEmail: 'billing@clientcorp.com',
              subject: `Urgent: Outstanding Balance for Invoice ${inv.invoiceNumber} - AVEX CRM`,
              emailBody: `Dear ${inv.customerName} Accounts Team,\n\nWe hope this email finds you well. Our records show that Invoice ${inv.invoiceNumber} ($${inv.amount.toLocaleString()}), originally due on ${inv.dueDate}, remains unpaid.\n\nPlease confirm payment status or let us know if you require any additional documentation.\n\nThank you,\nAVEX CRM Finance Team`,
              notificationMessage: `Payment reminder ready to send to ${inv.customerName} for ${inv.invoiceNumber}.`,
              deepLinkUrl: '/invoices',
            },
            createdAt: new Date().toISOString(),
          };
          currentQueue.push(item);
          generated.push(item);
        }
      }
    }

    // 2. Trigger: Inactive Stalled Leads
    if (ctx.leads.stalledOrNeedsAttention.length > 0) {
      for (const lead of ctx.leads.stalledOrNeedsAttention) {
        const autoId = `auto_lead_${lead.id}_${companyId}`;
        const existing = currentQueue.find((a) => a.id === autoId);

        if (!existing) {
          const item: AIAutomationItem = {
            id: autoId,
            companyId,
            triggerType: 'LEAD_INACTIVE',
            actionType: 'SCHEDULE_FOLLOW_UP',
            title: `Follow-up Required: ${lead.name} (${lead.company})`,
            description: `Lead deal value is $${lead.value.toLocaleString()} with ${lead.daysInactive} days of inactivity in pipeline.`,
            urgency: 'HIGH',
            entityId: lead.id,
            entityType: 'LEAD',
            status: 'PENDING_APPROVAL',
            preparedPayload: {
              recipientName: lead.name,
              recipientEmail: 'prospect@acmedynamics.com',
              subject: `Checking in: AVEX Enterprise Partnership Discussion`,
              emailBody: `Hi ${lead.name},\n\nI wanted to follow up on our previous conversation regarding your software requirements at ${lead.company}. We have prepared tailored roadmap details for your team.\n\nWould you have 15 minutes this week for a brief alignment call?\n\nBest regards,\nAVEX Sales Team`,
              calendarTitle: `Follow-up Call with ${lead.name} (${lead.company})`,
              calendarDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              notificationMessage: `Follow-up recommendation generated for ${lead.name}.`,
              deepLinkUrl: '/crm/leads',
            },
            createdAt: new Date().toISOString(),
          };
          currentQueue.push(item);
          generated.push(item);
        }
      }
    }

    // 3. Trigger: Customer Inactivity Check-in
    if (ctx.customers.uncontactedPast30Days > 0) {
      const autoId = `auto_cust_retention_${companyId}`;
      const existing = currentQueue.find((a) => a.id === autoId);

      if (!existing) {
        const item: AIAutomationItem = {
          id: autoId,
          companyId,
          triggerType: 'CUSTOMER_INACTIVITY',
          actionType: 'CREATE_CALENDAR_TASK',
          title: `Account Check-in: Global Logistics Corp`,
          description: `Key customer account has had zero logged touchpoints in over 30 days.`,
          urgency: 'MEDIUM',
          entityId: 'cust_01',
          entityType: 'CUSTOMER',
          status: 'PENDING_APPROVAL',
          preparedPayload: {
            recipientName: 'Global Logistics Corp Team',
            recipientEmail: 'contact@globallogistics.com',
            subject: `Quarterly Account Check-in - AVEX CRM`,
            emailBody: `Hello Global Logistics Team,\n\nChecking in to ensure everything is running smoothly with your AVEX CRM deployment and see if your team needs any assistance or feature walkthroughs.\n\nLooking forward to catching up!`,
            calendarTitle: `Quarterly Review Call: Global Logistics Corp`,
            calendarDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            deepLinkUrl: '/crm/customers',
          },
          createdAt: new Date().toISOString(),
        };
        currentQueue.push(item);
        generated.push(item);
      }
    }

    return currentQueue;
  }

  /**
   * Retrieves automation queue and summary KPIs
   */
  static async getQueue(companyId: string): Promise<{ items: AIAutomationItem[]; summary: AutomationSummaryKPIs }> {
    if (!memoryAutomationQueue[companyId] || memoryAutomationQueue[companyId].length === 0) {
      await this.scanAndGenerate(companyId);
    }

    const items = memoryAutomationQueue[companyId] || [];

    const summary: AutomationSummaryKPIs = {
      pendingCount: items.filter((i) => i.status === 'PENDING_APPROVAL').length,
      executedCount: items.filter((i) => i.status === 'EXECUTED').length,
      dismissedCount: items.filter((i) => i.status === 'DISMISSED').length,
      highUrgencyCount: items.filter((i) => i.status === 'PENDING_APPROVAL' && (i.urgency === 'CRITICAL' || i.urgency === 'HIGH')).length,
    };

    return { items, summary };
  }
}
