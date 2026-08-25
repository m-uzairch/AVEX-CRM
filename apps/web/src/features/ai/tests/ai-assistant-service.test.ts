import { describe, it, expect } from 'vitest';
import { AIAssistantService } from '../services/ai-assistant-service';
import { AIInsightsService } from '../services/ai-insights-service';

describe('AIAssistantService & Insights Tests', () => {
  it('detects user intent accurately for finance, leads, customers, projects, and attendance', () => {
    expect(AIAssistantService.detectIntent('What were our sales this month?')).toBe('FINANCE_QUERY');
    expect(AIAssistantService.detectIntent('Which invoices are overdue?')).toBe('FINANCE_QUERY');
    expect(AIAssistantService.detectIntent('How many leads in the pipeline?')).toBe('LEADS_QUERY');
    expect(AIAssistantService.detectIntent('Show high value customer accounts')).toBe('CUSTOMERS_QUERY');
    expect(AIAssistantService.detectIntent('Which projects are delayed?')).toBe('PROJECTS_QUERY');
    expect(AIAssistantService.detectIntent('Team attendance status today')).toBe('ATTENDANCE_QUERY');
  });

  it('generates structured answer with actionable references and follow-ups', async () => {
    const answer = await AIAssistantService.ask('Which invoices are overdue?', 'comp_001');

    expect(answer.content).toBeDefined();
    expect(answer.content.length).toBeGreaterThan(20);
    expect(answer.intent).toBe('FINANCE_QUERY');
    expect(answer.references.length).toBeGreaterThan(0);
    expect(answer.suggestedFollowUps.length).toBeGreaterThan(0);
  });

  it('AIInsightsService generates proactive insight cards with metrics', async () => {
    const insights = await AIInsightsService.generateInsights('comp_001');

    expect(insights).toBeInstanceOf(Array);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].actionUrl).toBeDefined();
    expect(insights[0].title).toBeDefined();
  });
});
