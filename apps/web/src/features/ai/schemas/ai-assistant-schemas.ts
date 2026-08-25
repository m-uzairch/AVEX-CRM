import { z } from 'zod';

export type AssistantIntent =
  | 'LEADS_QUERY'
  | 'FINANCE_QUERY'
  | 'CUSTOMERS_QUERY'
  | 'PROJECTS_QUERY'
  | 'ATTENDANCE_QUERY'
  | 'OPERATIONS_SUMMARY'
  | 'GENERAL_QUERY';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  references?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

export interface CRMContextSnapshot {
  companyName: string;
  currentDate: string;
  leads: {
    total: number;
    totalPipelineValue: number;
    newThisMonth: number;
    stalledOrNeedsAttention: Array<{ id: string; name: string; company: string; value: number; daysInactive: number }>;
    byStage: Record<string, number>;
  };
  customers: {
    totalActive: number;
    highValueAccounts: Array<{ id: string; name: string; lifetimeValue: number; currency: string }>;
    uncontactedPast30Days: number;
  };
  finance: {
    revenueThisMonth: number;
    totalOverdueInvoices: number;
    totalOverdueAmount: number;
    currency: string;
    overdueList: Array<{ id: string; invoiceNumber: string; customerName: string; amount: number; dueDate: string }>;
  };
  projects: {
    activeCount: number;
    delayedCount: number;
    delayedList: Array<{ id: string; name: string; expectedCompletion: string }>;
    upcomingMilestones: Array<{ title: string; date: string; project: string }>;
  };
  attendance: {
    totalTeam: number;
    presentToday: number;
    clockedInNow: number;
    lateArrivals: number;
    missingClockIns: number;
  };
}

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export interface SmartInsightItem {
  id: string;
  category: 'SALES' | 'FINANCE' | 'CUSTOMERS' | 'OPERATIONS' | 'ATTENDANCE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  metric?: string;
  actionLabel: string;
  actionUrl: string;
  createdAt: string;
}
