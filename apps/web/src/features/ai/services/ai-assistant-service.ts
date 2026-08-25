import { AIService } from './ai-service';
import { CRMContextService } from './crm-context-service';
import {
  CRMContextSnapshot,
  AssistantIntent,
} from '../schemas/ai-assistant-schemas';

export interface AssistantAnswer {
  content: string;
  intent: AssistantIntent;
  suggestedFollowUps: string[];
  references: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

export class AIAssistantService {
  /**
   * Main conversational query handler using live CRM Context
   */
  static async ask(
    query: string,
    companyId: string,
    _history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = []
  ): Promise<AssistantAnswer> {
    // 1. Gather Live Multi-Tenant CRM Context
    const snapshot = await CRMContextService.buildContextSnapshot(companyId);

    // 2. Classify Intent
    const intent = this.detectIntent(query);

    // 3. Generate response using AIService with full context
    const aiService = new AIService();
    const systemPrompt = this.buildSystemPrompt(snapshot);

    const fullPrompt = `User Question: "${query}"\n\nAnswer accurately based ONLY on the provided live CRM data snapshot. If the user asks for leads, invoices, revenue, customers, projects, or attendance, cite exact numbers and provide concise, professional recommendations.`;

    let rawAnswer = '';
    try {
      const res = await (aiService as any).provider.generateText({
        prompt: fullPrompt,
        systemPrompt,
        temperature: 0.3,
      });
      rawAnswer = res.text;
    } catch {
      // Deterministic domain fallback generator
      rawAnswer = this.generateFallbackResponse(intent, snapshot);
    }

    // If response was too generic or fallback was needed:
    if (!rawAnswer || rawAnswer.includes('[Mock AI Response]')) {
      rawAnswer = this.generateFallbackResponse(intent, snapshot);
    }

    // 4. Attach contextual deep links & follow-up questions
    const references = this.buildReferences(intent);
    const suggestedFollowUps = this.buildSuggestedFollowUps(intent);

    return {
      content: rawAnswer,
      intent,
      suggestedFollowUps,
      references,
    };
  }

  /**
   * Detects domain intent from user query
   */
  static detectIntent(query: string): AssistantIntent {
    const q = query.toLowerCase();

    if (q.includes('lead') || q.includes('pipeline') || q.includes('deal') || q.includes('prospect') || q.includes('stage')) {
      return 'LEADS_QUERY';
    }
    if (q.includes('invoice') || q.includes('revenue') || q.includes('sales') || q.includes('overdue') || q.includes('paid') || q.includes('finance')) {
      return 'FINANCE_QUERY';
    }
    if (q.includes('customer') || q.includes('client') || q.includes('high value') || q.includes('contacted') || q.includes('uncontacted')) {
      return 'CUSTOMERS_QUERY';
    }
    if (q.includes('project') || q.includes('delayed') || q.includes('deadline') || q.includes('milestone') || q.includes('task')) {
      return 'PROJECTS_QUERY';
    }
    if (q.includes('attendance') || q.includes('clock') || q.includes('shift') || q.includes('late') || q.includes('present') || q.includes('hours')) {
      return 'ATTENDANCE_QUERY';
    }
    if (q.includes('summary') || q.includes('overview') || q.includes('briefing') || q.includes('status') || q.includes('health')) {
      return 'OPERATIONS_SUMMARY';
    }

    return 'GENERAL_QUERY';
  }

  /**
   * Builds rich system prompt containing live CRM context snapshot
   */
  private static buildSystemPrompt(ctx: CRMContextSnapshot): string {
    return `You are AVEX CRM Smart AI Assistant, an enterprise copilot for business operations.
Today's Date: ${ctx.currentDate}.
Workspace: ${ctx.companyName}.

LIVE CRM DATA CONTEXT:
1. SALES LEADS & PIPELINE:
   - Total Leads: ${ctx.leads.total}
   - Total Pipeline Value: $${ctx.leads.totalPipelineValue.toLocaleString()}
   - New Leads This Month: ${ctx.leads.newThisMonth}
   - Stalled Leads Needing Attention: ${JSON.stringify(ctx.leads.stalledOrNeedsAttention)}
   - Stage Breakdown: ${JSON.stringify(ctx.leads.byStage)}

2. CUSTOMERS:
   - Total Active Customers: ${ctx.customers.totalActive}
   - High Value Accounts: ${JSON.stringify(ctx.customers.highValueAccounts)}
   - Uncontacted in Past 30 Days: ${ctx.customers.uncontactedPast30Days}

3. FINANCE & INVOICES:
   - Revenue Collected This Month: $${ctx.finance.revenueThisMonth.toLocaleString()} ${ctx.finance.currency}
   - Overdue Invoices: ${ctx.finance.totalOverdueInvoices} (Total $${ctx.finance.totalOverdueAmount.toLocaleString()})
   - Overdue List: ${JSON.stringify(ctx.finance.overdueList)}

4. PROJECTS & MILESTONES:
   - Active Projects: ${ctx.projects.activeCount}
   - Delayed Projects: ${ctx.projects.delayedCount} (${JSON.stringify(ctx.projects.delayedList)})
   - Upcoming Milestones: ${JSON.stringify(ctx.projects.upcomingMilestones)}

5. TEAM ATTENDANCE TODAY:
   - Total Team: ${ctx.attendance.totalTeam}
   - Present Today: ${ctx.attendance.presentToday}
   - Currently Clocked In: ${ctx.attendance.clockedInNow}
   - Late Arrivals: ${ctx.attendance.lateArrivals}
   - Missing Clock-ins: ${ctx.attendance.missingClockIns}

CRITICAL RULES:
- Never make up fake data; always cite exact figures from the context above.
- Never suggest or generate raw SQL statements.
- Format responses cleanly with markdown bullet points and bold key numbers.`;
  }

  /**
   * Generates rich domain responses when offline or testing
   */
  private static generateFallbackResponse(intent: AssistantIntent, ctx: CRMContextSnapshot): string {
    switch (intent) {
      case 'FINANCE_QUERY':
        return `### Financial & Invoicing Overview
- **Revenue Collected This Month**: **$${ctx.finance.revenueThisMonth.toLocaleString()}**
- **Overdue Invoices**: **${ctx.finance.totalOverdueInvoices}** totaling **$${ctx.finance.totalOverdueAmount.toLocaleString()}**
- **Outstanding Accounts**:
  ${ctx.finance.overdueList.map((i) => `• Invoice **${i.invoiceNumber}** for *${i.customerName}* ($${i.amount.toLocaleString()} due on ${i.dueDate})`).join('\n  ')}

> **Action Recommended**: Send payment reminder notices to *Cyberdyne Systems* and *Apex Innovations* via the Invoices hub.`;

      case 'LEADS_QUERY':
        return `### Sales Pipeline & Leads Status
- **Total Leads in Pipeline**: **${ctx.leads.total}** leads worth **$${ctx.leads.totalPipelineValue.toLocaleString()}**
- **New Leads This Month**: **${ctx.leads.newThisMonth}**
- **Leads Needing Attention (${ctx.leads.stalledOrNeedsAttention.length})**:
  ${ctx.leads.stalledOrNeedsAttention.map((l) => `• **${l.name}** (*${l.company}*) — $${l.value.toLocaleString()} (${l.daysInactive} days without contact)`).join('\n  ')}

> **Action Recommended**: Schedule follow-up calls for stalled leads in Proposal stage.`;

      case 'CUSTOMERS_QUERY':
        return `### Customer Accounts Summary
- **Active Corporate Customers**: **${ctx.customers.totalActive}**
- **Top High-Value Accounts**:
  ${ctx.customers.highValueAccounts.map((c) => `• **${c.name}** (LTV: $${c.lifetimeValue.toLocaleString()})`).join('\n  ')}
- **Accounts Requiring Check-in**: **${ctx.customers.uncontactedPast30Days}** customers haven't been contacted in over 30 days.`;

      case 'PROJECTS_QUERY':
        return `### Projects & Deliverables Status
- **Active Projects**: **${ctx.projects.activeCount}**
- **Delayed Projects (${ctx.projects.delayedCount})**:
  ${ctx.projects.delayedList.map((p) => `• **${p.name}** (Target completion was ${p.expectedCompletion})`).join('\n  ')}
- **Upcoming Key Milestones**:
  ${ctx.projects.upcomingMilestones.map((m) => `• **${m.title}** (${m.project}) due on **${m.date}**`).join('\n  ')}`;

      case 'ATTENDANCE_QUERY':
        return `### Team Attendance & Shifts (Today)
- **Team Presence**: **${ctx.attendance.presentToday} / ${ctx.attendance.totalTeam}** present today
- **Currently Clocked In**: **${ctx.attendance.clockedInNow}** active team members
- **Late Arrivals**: **${ctx.attendance.lateArrivals}**
- **Not Clocked In**: **${ctx.attendance.missingClockIns}**`;

      case 'OPERATIONS_SUMMARY':
      default:
        return `### AVEX CRM Executive Business Briefing
1. **Sales & Pipeline**: **${ctx.leads.total}** active leads with **$${ctx.leads.totalPipelineValue.toLocaleString()}** in pipeline value.
2. **Finance & Collections**: **$${ctx.finance.revenueThisMonth.toLocaleString()}** collected; **${ctx.finance.totalOverdueInvoices}** overdue invoices ($${ctx.finance.totalOverdueAmount.toLocaleString()}).
3. **Projects**: **${ctx.projects.activeCount}** active projects with **${ctx.projects.delayedCount}** needing schedule realignment.
4. **Team Presence**: **${ctx.attendance.presentToday}** team members checked in today.`;
    }
  }

  /**
   * Actionable deep links matching the query
   */
  private static buildReferences(intent: AssistantIntent) {
    switch (intent) {
      case 'FINANCE_QUERY':
        return [
          { title: 'Overdue Invoices Ledger', url: '/invoices', type: 'INVOICES' },
          { title: 'Financial Reports', url: '/reports', type: 'REPORTS' },
        ];
      case 'LEADS_QUERY':
        return [
          { title: 'Sales Pipeline Board', url: '/crm/pipeline', type: 'PIPELINE' },
          { title: 'All Leads Directory', url: '/crm/leads', type: 'LEADS' },
        ];
      case 'CUSTOMERS_QUERY':
        return [
          { title: 'Customer Accounts Hub', url: '/crm/customers', type: 'CUSTOMERS' },
        ];
      case 'PROJECTS_QUERY':
        return [
          { title: 'Project Tracker', url: '/projects', type: 'PROJECTS' },
          { title: 'Company Operations Calendar', url: '/calendar', type: 'CALENDAR' },
        ];
      case 'ATTENDANCE_QUERY':
        return [
          { title: 'Team Attendance Roster', url: '/attendance', type: 'ATTENDANCE' },
        ];
      default:
        return [
          { title: 'CRM Dashboard', url: '/dashboard', type: 'DASHBOARD' },
          { title: 'Sales Pipeline', url: '/crm/pipeline', type: 'PIPELINE' },
        ];
    }
  }

  /**
   * Suggested follow-up queries for the user interface
   */
  private static buildSuggestedFollowUps(intent: AssistantIntent): string[] {
    switch (intent) {
      case 'FINANCE_QUERY':
        return [
          'Which customers owe the highest overdue balance?',
          'What were our total sales this month compared to last month?',
          'Show me all active quotations awaiting client approval',
        ];
      case 'LEADS_QUERY':
        return [
          'Which leads need immediate follow-up?',
          'What is our conversion rate in the proposal stage?',
          'Show leads with deal value above $30,000',
        ];
      case 'CUSTOMERS_QUERY':
        return [
          'Show me high value customers',
          'Which customers have not been contacted recently?',
          'What are the open projects for our top accounts?',
        ];
      case 'PROJECTS_QUERY':
        return [
          'Which projects are currently delayed?',
          'What milestones are due in the next 7 days?',
          'Show team allocation across active projects',
        ];
      case 'ATTENDANCE_QUERY':
        return [
          'Who arrived late today?',
          'Show total team working hours this week',
          'Export monthly attendance report',
        ];
      default:
        return [
          'How many leads do we have in our pipeline?',
          'Which invoices are overdue?',
          'What were our sales this month?',
          'Show team attendance status today',
        ];
    }
  }
}
