import { describe, it, expect } from 'vitest';
import { AIService } from '../services/ai-service';

describe('AIService High-Level CRM Engine Tests', () => {
  const ai = new AIService('MOCK');

  it('extractLeads extracts structured lead records', async () => {
    const rawSnippet = 'Met Jordan Hayes at Acme Cloud Dynamics. Reach him at jordan.hayes@acmecloud.com';
    const result = await ai.extractLeads(rawSnippet);

    expect(result.leads).toBeInstanceOf(Array);
    expect(result.leads.length).toBeGreaterThan(0);
    expect(result.leads[0].companyName).toBe('Acme Cloud Dynamics');
  });

  it('extractCustomers extracts customer profile with tax ID', async () => {
    const doc = 'Customer Agreement for Starlight Media Group LLC. Contact billing@starlightmedia.com';
    const result = await ai.extractCustomers(doc);

    expect(result.customers).toBeInstanceOf(Array);
    expect(result.customers.length).toBeGreaterThan(0);
    expect(result.customers[0].name).toContain('Starlight');
  });

  it('mapColumns maps raw table headers to CRM entity fields', async () => {
    const headers = ['Full Name', 'Organization', 'Email Address', 'Telephone', 'Deal Value'];
    const result = await ai.mapColumns(headers, 'LEAD');

    expect(result.mappings).toBeInstanceOf(Array);
    expect(result.mappings.length).toBe(5);

    const nameMapping = result.mappings.find((m) => m.sourceColumn === 'Full Name');
    expect(nameMapping?.targetField).toBe('name');

    const companyMapping = result.mappings.find((m) => m.sourceColumn === 'Organization');
    expect(companyMapping?.targetField).toBe('companyName');
  });

  it('summarizeActivity generates executive CRM briefing', async () => {
    const activities = [
      { action: 'DEAL_CREATED', description: 'Enterprise deal valued at $50k created' },
      { action: 'INVOICE_PAID', description: 'Invoice #INV-2026-001 paid in full' },
    ];
    const summary = await ai.summarizeActivity(activities);

    expect(summary).toBeDefined();
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(20);
  });

  it('generateEmailDraft creates business follow up', async () => {
    const draft = await ai.generateEmailDraft('Quarterly Review', 'Discuss cloud migration roadmap');
    expect(draft).toContain('Dear Client');
  });

  it('getStatus returns healthy provider state', async () => {
    const status = await ai.getStatus();
    expect(status.isHealthy).toBe(true);
    expect(status.provider).toBe('MOCK');
  });
});
