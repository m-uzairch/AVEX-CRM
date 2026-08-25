import { z } from 'zod';

export type InsightCategory =
  | 'FINANCE'
  | 'SALES'
  | 'CUSTOMERS'
  | 'PROJECTS'
  | 'ATTENDANCE'
  | 'OPERATIONS';

export type InsightPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface InsightAction {
  label: string;
  url: string;
  type: 'NAVIGATE' | 'REMINDER' | 'FOLLOW_UP' | 'CALL';
}

export interface SmartInsight {
  id: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  aiExplanation?: string;
  impactMetric?: string;
  monetaryValue?: number;
  entityId?: string;
  entityType?: string;
  action: InsightAction;
  isDismissed?: boolean;
  createdAt: string;
}

export interface InsightsSummaryKPIs {
  totalActive: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalCashAtRisk: number;
  pipelineOpportunityValue: number;
}

export const insightFilterSchema = z.object({
  category: z.enum(['ALL', 'FINANCE', 'SALES', 'CUSTOMERS', 'PROJECTS', 'ATTENDANCE', 'OPERATIONS']).optional().default('ALL'),
  priority: z.enum(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional().default('ALL'),
  search: z.string().optional().default(''),
});

export type InsightFilterOptions = z.infer<typeof insightFilterSchema>;
