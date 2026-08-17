import { describe, it, expect } from 'vitest';
import { AutomationService } from '../services/automation-service';

describe('AutomationService Unit Tests', () => {
  it('should run all master background automations cleanly', async () => {
    const res = await AutomationService.runAllAutomations('comp_001');
    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(typeof res.timestamp).toBe('string');
    expect(res.recurringInvoices).toBeDefined();
    expect(res.overdueReminders).toBeDefined();
    expect(res.scheduledReports).toBeDefined();
  });
});
