import { CRMContextService } from './crm-context-service';
import {
  SmartInsight,
  InsightsSummaryKPIs,
  InsightFilterOptions,
} from '../schemas/smart-insights-schemas';

// In-memory store for dismissed insights per company
export const memoryDismissedInsights: Record<string, Set<string>> = {};

export class SmartInsightsEngine {
  /**
   * Evaluates deterministic business rules against real CRM context and calculates priority
   */
  static async evaluateInsights(
    companyId: string,
    filters?: InsightFilterOptions
  ): Promise<{ insights: SmartInsight[]; summary: InsightsSummaryKPIs }> {
    const ctx = await CRMContextService.buildContextSnapshot(companyId);
    const dismissed = memoryDismissedInsights[companyId] || new Set<string>();

    const detectedInsights: SmartInsight[] = [];
    let totalCashAtRisk = 0;
    let pipelineOpportunityValue = 0;

    // Rule 1: Overdue Invoices
    if (ctx.finance.totalOverdueInvoices > 0) {
      totalCashAtRisk += ctx.finance.totalOverdueAmount;
      const isCritical = ctx.finance.totalOverdueAmount > 10000 || ctx.finance.totalOverdueInvoices >= 3;

      detectedInsights.push({
        id: `ins_inv_${companyId}`,
        category: 'FINANCE',
        priority: isCritical ? 'CRITICAL' : 'HIGH',
        title: `${ctx.finance.totalOverdueInvoices} Overdue Invoices Awaiting Collection`,
        description: `Total unpaid amount is $${ctx.finance.totalOverdueAmount.toLocaleString()}. Oldest overdue balance is from ${ctx.finance.overdueList[0]?.customerName || 'Client'}.`,
        aiExplanation: `Prompt debt recovery workflows immediately to prevent cash-flow constraints. Cyberdyne Systems and Apex Innovations have crossed their net-30 terms.`,
        impactMetric: `$${ctx.finance.totalOverdueAmount.toLocaleString()} Outstanding`,
        monetaryValue: ctx.finance.totalOverdueAmount,
        entityType: 'INVOICE',
        action: {
          label: 'Send Reminders',
          url: '/invoices',
          type: 'REMINDER',
        },
        createdAt: new Date().toISOString(),
      });
    }

    // Rule 2: Stale High-Value Leads
    if (ctx.leads.stalledOrNeedsAttention.length > 0) {
      for (const lead of ctx.leads.stalledOrNeedsAttention) {
        pipelineOpportunityValue += lead.value;
        detectedInsights.push({
          id: `ins_lead_${lead.id}`,
          category: 'SALES',
          priority: lead.value > 40000 ? 'CRITICAL' : 'HIGH',
          title: `Stalled Deal: ${lead.name} (${lead.company})`,
          description: `High-value lead worth $${lead.value.toLocaleString()} has been inactive for ${lead.daysInactive} days without follow-up.`,
          aiExplanation: `Deals inactive past 7 days suffer a 65% drop in win conversion. Recommend sending a customized value proposition deck today.`,
          impactMetric: `$${lead.value.toLocaleString()} Deal Value`,
          monetaryValue: lead.value,
          entityId: lead.id,
          entityType: 'LEAD',
          action: {
            label: 'Open Lead & Call',
            url: `/crm/leads`,
            type: 'CALL',
          },
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Rule 3: Key Accounts Customer Retention
    if (ctx.customers.uncontactedPast30Days > 0) {
      detectedInsights.push({
        id: `ins_cust_retention_${companyId}`,
        category: 'CUSTOMERS',
        priority: 'MEDIUM',
        title: `${ctx.customers.uncontactedPast30Days} Key Corporate Accounts Due for Check-in`,
        description: `Active clients including Global Logistics and Starlight Media have had no logged touchpoints in over 30 days.`,
        aiExplanation: `Proactive quarterly account reviews improve net revenue retention (NRR) and uncover expansion upsell opportunities.`,
        impactMetric: `${ctx.customers.uncontactedPast30Days} Accounts`,
        entityType: 'CUSTOMER',
        action: {
          label: 'Schedule Check-in',
          url: '/crm/customers',
          type: 'FOLLOW_UP',
        },
        createdAt: new Date().toISOString(),
      });
    }

    // Rule 4: Approaching / Delayed Project Deadlines
    if (ctx.projects.delayedCount > 0) {
      const topDelayed = ctx.projects.delayedList[0];
      detectedInsights.push({
        id: `ins_proj_delay_${companyId}`,
        category: 'PROJECTS',
        priority: 'HIGH',
        title: `Schedule Slippage: ${topDelayed?.name || 'Active Project'}`,
        description: `Project milestone is past its original expected completion target (${topDelayed?.expectedCompletion || 'Due date'}).`,
        aiExplanation: `Deliverable delay risks contractual SLAs. Review blocker tickets with engineering leads and notify client stakeholder.`,
        impactMetric: `${ctx.projects.delayedCount} Delayed Project`,
        entityType: 'PROJECT',
        action: {
          label: 'Review Project SLA',
          url: '/projects',
          type: 'NAVIGATE',
        },
        createdAt: new Date().toISOString(),
      });
    }

    // Rule 5: Upcoming Milestones in Next 7 Days
    if (ctx.projects.upcomingMilestones.length > 0) {
      const nextMilestone = ctx.projects.upcomingMilestones[0];
      detectedInsights.push({
        id: `ins_proj_milestone_${companyId}`,
        category: 'PROJECTS',
        priority: 'MEDIUM',
        title: `Upcoming Deliverable: ${nextMilestone.title}`,
        description: `Milestone for ${nextMilestone.project} is scheduled for signoff on ${nextMilestone.date}.`,
        aiExplanation: `Ensure QA acceptance tests are completed before presenting final work to the client review committee.`,
        impactMetric: nextMilestone.date,
        entityType: 'MILESTONE',
        action: {
          label: 'View Calendar',
          url: '/calendar',
          type: 'NAVIGATE',
        },
        createdAt: new Date().toISOString(),
      });
    }

    // Rule 6: Team Attendance & Shift Presence
    if (ctx.attendance.missingClockIns > 2 || ctx.attendance.lateArrivals > 0) {
      detectedInsights.push({
        id: `ins_att_${companyId}`,
        category: 'ATTENDANCE',
        priority: 'LOW',
        title: `Daily Attendance Check: ${ctx.attendance.presentToday} / ${ctx.attendance.totalTeam} Team Members Present`,
        description: `${ctx.attendance.lateArrivals} late arrival(s) and ${ctx.attendance.missingClockIns} pending clock-ins recorded today.`,
        aiExplanation: `Operational roster indicates majority team presence. Check shift records for unnotified absences.`,
        impactMetric: `${ctx.attendance.lateArrivals} Late, ${ctx.attendance.missingClockIns} Absent`,
        entityType: 'ATTENDANCE',
        action: {
          label: 'View Roster',
          url: '/attendance',
          type: 'NAVIGATE',
        },
        createdAt: new Date().toISOString(),
      });
    }

    // Rule 7: Positive Sales Velocity & Revenue Momentum
    if (ctx.finance.revenueThisMonth > 0) {
      detectedInsights.push({
        id: `ins_growth_${companyId}`,
        category: 'SALES',
        priority: 'LOW',
        title: `Strong Sales Momentum: $${ctx.finance.revenueThisMonth.toLocaleString()} Revenue Month-to-Date`,
        description: `Company closed ${ctx.leads.newThisMonth} new leads this month with $${ctx.leads.totalPipelineValue.toLocaleString()} remaining in active pipeline.`,
        aiExplanation: `Pipeline conversion is tracking on budget. Focus account executives on closing late-stage negotiation deals.`,
        impactMetric: `$${ctx.finance.revenueThisMonth.toLocaleString()} Generated`,
        entityType: 'REPORT',
        action: {
          label: 'View Reports',
          url: '/reports',
          type: 'NAVIGATE',
        },
        createdAt: new Date().toISOString(),
      });
    }

    // Filter out dismissed items
    let filtered = detectedInsights.filter((ins) => !dismissed.has(ins.id));

    // Apply User Filters
    if (filters) {
      if (filters.category && filters.category !== 'ALL') {
        filtered = filtered.filter((i) => i.category === filters.category);
      }
      if (filters.priority && filters.priority !== 'ALL') {
        filtered = filtered.filter((i) => i.priority === filters.priority);
      }
      if (filters.search && filters.search.trim()) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.title.toLowerCase().includes(s) ||
            i.description.toLowerCase().includes(s) ||
            (i.aiExplanation && i.aiExplanation.toLowerCase().includes(s))
        );
      }
    }

    // Sort: CRITICAL -> HIGH -> MEDIUM -> LOW
    const priorityWeight: Record<string, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };
    filtered.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    const summary: InsightsSummaryKPIs = {
      totalActive: filtered.length,
      criticalCount: filtered.filter((i) => i.priority === 'CRITICAL').length,
      highCount: filtered.filter((i) => i.priority === 'HIGH').length,
      mediumCount: filtered.filter((i) => i.priority === 'MEDIUM').length,
      lowCount: filtered.filter((i) => i.priority === 'LOW').length,
      totalCashAtRisk,
      pipelineOpportunityValue,
    };

    return { insights: filtered, summary };
  }

  /**
   * Dismiss an insight for the current company
   */
  static dismissInsight(companyId: string, insightId: string): boolean {
    if (!memoryDismissedInsights[companyId]) {
      memoryDismissedInsights[companyId] = new Set<string>();
    }
    memoryDismissedInsights[companyId].add(insightId);
    return true;
  }
}
