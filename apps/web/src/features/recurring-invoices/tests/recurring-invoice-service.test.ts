import { describe, it, expect } from 'vitest';
import { RecurringInvoiceService } from '../services/recurring-invoice-service';

describe('RecurringInvoiceService Unit Tests', () => {
  it('should calculate correct next billing date for MONTHLY frequency', () => {
    const base = new Date('2026-08-01T00:00:00.000Z');
    const next = RecurringInvoiceService.calculateNextBillingDate('MONTHLY', 30, base);
    expect(next.toISOString().substring(0, 7)).toBe('2026-09');
  });

  it('should calculate correct next billing date for QUARTERLY frequency', () => {
    const base = new Date('2026-08-01T00:00:00.000Z');
    const next = RecurringInvoiceService.calculateNextBillingDate('QUARTERLY', 90, base);
    expect(next.toISOString().substring(0, 7)).toBe('2026-11');
  });

  it('should calculate correct next billing date for YEARLY frequency', () => {
    const base = new Date('2026-08-01T00:00:00.000Z');
    const next = RecurringInvoiceService.calculateNextBillingDate('YEARLY', 365, base);
    expect(next.toISOString().substring(0, 4)).toBe('2027');
  });

  it('should calculate correct next billing date for CUSTOM days interval', () => {
    const base = new Date('2026-08-01T00:00:00.000Z');
    const next = RecurringInvoiceService.calculateNextBillingDate('CUSTOM', 15, base);
    expect(next.getDate()).toBe(16);
  });

  it('should calculate KPI summary with zero errors', async () => {
    const summary = await RecurringInvoiceService.getKPISummary('comp_001');
    expect(summary).toBeDefined();
    expect(typeof summary.monthlyRecurringRevenue).toBe('number');
    expect(typeof summary.totalActiveSubscriptions).toBe('number');
  });
});
