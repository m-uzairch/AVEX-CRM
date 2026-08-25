import { CRMContextService } from './crm-context-service';
import { SmartInsightItem } from '../schemas/ai-assistant-schemas';

export class AIInsightsService {
  /**
   * Generates proactive, actionable smart insights from the live company CRM context
   */
  static async generateInsights(companyId: string): Promise<SmartInsightItem[]> {
    const ctx = await CRMContextService.buildContextSnapshot(companyId);
    const insights: SmartInsightItem[] = [];

    // 1. Finance & Overdue Invoices
    if (ctx.finance.totalOverdueInvoices > 0) {
      insights.push({
        id: `ins_fin_${Date.now()}`,
        category: 'FINANCE',
        priority: 'HIGH',
        title: `${ctx.finance.totalOverdueInvoices} Overdue Invoices Awaiting Payment`,
        description: `Total outstanding balance is $${ctx.finance.totalOverdueAmount.toLocaleString()}. The largest overdue account is ${ctx.finance.overdueList[0]?.customerName || 'Client'}.`,
        metric: `$${ctx.finance.totalOverdueAmount.toLocaleString()} Pending`,
        actionLabel: 'Review Invoices',
        actionUrl: '/invoices',
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Sales Pipeline & Stalled Leads
    if (ctx.leads.stalledOrNeedsAttention.length > 0) {
      const topStalled = ctx.leads.stalledOrNeedsAttention[0];
      insights.push({
        id: `ins_lead_${Date.now()}`,
        category: 'SALES',
        priority: 'HIGH',
        title: `High-Value Lead Needs Immediate Attention`,
        description: `Lead "${topStalled.name}" (${topStalled.company}, $${topStalled.value.toLocaleString()}) has had no updates in ${topStalled.daysInactive} days.`,
        metric: `$${topStalled.value.toLocaleString()} Deal Value`,
        actionLabel: 'Open Pipeline',
        actionUrl: '/crm/pipeline',
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Uncontacted Customer Retention
    if (ctx.customers.uncontactedPast30Days > 0) {
      insights.push({
        id: `ins_cust_${Date.now()}`,
        category: 'CUSTOMERS',
        priority: 'MEDIUM',
        title: `${ctx.customers.uncontactedPast30Days} Key Accounts Due for Check-in`,
        description: `Several active corporate accounts haven't been contacted in over 30 days. Maintain relationship health with a check-in call.`,
        metric: `${ctx.customers.uncontactedPast30Days} Accounts`,
        actionLabel: 'View Customers',
        actionUrl: '/crm/customers',
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Delayed Projects
    if (ctx.projects.delayedCount > 0) {
      insights.push({
        id: `ins_proj_${Date.now()}`,
        category: 'OPERATIONS',
        priority: 'MEDIUM',
        title: `${ctx.projects.delayedCount} Project Schedule Behind Target`,
        description: `Project "${ctx.projects.delayedList[0]?.name || 'Deliverable'}" is past its original expected completion date.`,
        metric: `${ctx.projects.delayedCount} Delayed`,
        actionLabel: 'Manage Projects',
        actionUrl: '/projects',
        createdAt: new Date().toISOString(),
      });
    }

    // 5. Positive Sales Momentum
    if (ctx.finance.revenueThisMonth > 0) {
      insights.push({
        id: `ins_rev_${Date.now()}`,
        category: 'FINANCE',
        priority: 'LOW',
        title: `Month-to-Date Revenue Velocity`,
        description: `Company has collected $${ctx.finance.revenueThisMonth.toLocaleString()} in revenue with ${ctx.leads.newThisMonth} new leads added this month.`,
        metric: `$${ctx.finance.revenueThisMonth.toLocaleString()} Collected`,
        actionLabel: 'View Reports',
        actionUrl: '/reports',
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  }
}
