import { describe, it, expect } from 'vitest';
import { SmartInsightsEngine } from '../services/smart-insights-engine';

describe('SmartInsightsEngine Deterministic Rules & Priority Suite', () => {
  it('evaluates deterministic rules and calculates summary KPIs', async () => {
    const result = await SmartInsightsEngine.evaluateInsights('comp_001');

    expect(result.insights).toBeInstanceOf(Array);
    expect(result.insights.length).toBeGreaterThan(0);
    expect(result.summary.totalActive).toBeGreaterThan(0);
    expect(result.summary.totalCashAtRisk).toBeGreaterThanOrEqual(0);

    // Verify ordering by priority (CRITICAL -> HIGH -> MEDIUM -> LOW)
    const priorityWeight: Record<string, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    for (let i = 0; i < result.insights.length - 1; i++) {
      expect(priorityWeight[result.insights[i].priority]).toBeGreaterThanOrEqual(
        priorityWeight[result.insights[i + 1].priority]
      );
    }
  });

  it('filters insights by category and priority correctly', async () => {
    const financeOnly = await SmartInsightsEngine.evaluateInsights('comp_001', {
      category: 'FINANCE',
      priority: 'ALL',
      search: '',
    });

    expect(financeOnly.insights.every((i) => i.category === 'FINANCE')).toBe(true);
  });

  it('dismisses insight correctly in company session', async () => {
    const initial = await SmartInsightsEngine.evaluateInsights('comp_001');
    const firstId = initial.insights[0].id;

    SmartInsightsEngine.dismissInsight('comp_001', firstId);

    const afterDismiss = await SmartInsightsEngine.evaluateInsights('comp_001');
    expect(afterDismiss.insights.some((i) => i.id === firstId)).toBe(false);
  });
});
