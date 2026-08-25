import { describe, it, expect } from 'vitest';
import { CRMContextService } from '../services/crm-context-service';

describe('CRMContextService Unit Tests', () => {
  it('builds comprehensive structured context snapshot for company workspace', async () => {
    const snapshot = await CRMContextService.buildContextSnapshot('comp_001');

    expect(snapshot).toBeDefined();
    expect(snapshot.leads.total).toBeGreaterThan(0);
    expect(snapshot.leads.totalPipelineValue).toBeGreaterThan(0);
    expect(snapshot.customers.totalActive).toBeGreaterThan(0);
    expect(snapshot.finance.revenueThisMonth).toBeGreaterThanOrEqual(0);
    expect(snapshot.finance.totalOverdueInvoices).toBeGreaterThanOrEqual(0);
    expect(snapshot.projects.activeCount).toBeGreaterThan(0);
    expect(snapshot.attendance.totalTeam).toBeGreaterThan(0);
  });
});
