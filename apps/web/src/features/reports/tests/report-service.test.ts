import { describe, it, expect } from 'vitest';
import { ReportService } from '../services/report-service';

describe('ReportService Unit Tests', () => {
  it('should generate valid Revenue Report data', async () => {
    const data = await ReportService.generateRevenueReport('comp_001');
    expect(data).toBeDefined();
    expect(typeof data.totalRevenue).toBe('number');
    expect(Array.isArray(data.trends)).toBe(true);
  });

  it('should generate valid Expense Report data', async () => {
    const data = await ReportService.generateExpenseReport('comp_001');
    expect(data).toBeDefined();
    expect(typeof data.totalExpenses).toBe('number');
    expect(Array.isArray(data.categories)).toBe(true);
  });

  it('should generate valid Profit & Loss Report data', async () => {
    const data = await ReportService.generateProfitLossReport('comp_001');
    expect(data).toBeDefined();
    expect(typeof data.grossProfit).toBe('number');
    expect(typeof data.netProfit).toBe('number');
  });

  it('should generate CSV export string properly', async () => {
    const revenueData = await ReportService.generateRevenueReport('comp_001');
    const csv = ReportService.exportToCSV('REVENUE', revenueData);
    expect(typeof csv).toBe('string');
    expect(csv).toContain('AVEX CRM - REVENUE REPORT');
  });
});
