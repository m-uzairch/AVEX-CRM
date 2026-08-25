import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getStatus } from '@/app/api/ai/status/route';
import { POST as extractLead } from '@/app/api/ai/extract/lead/route';
import { POST as extractCustomer } from '@/app/api/ai/extract/customer/route';
import { POST as mapColumns } from '@/app/api/ai/map-columns/route';

function createMockRequest(
  url: string,
  options: { method?: string; body?: any; cookies?: Record<string, string> } = {}
) {
  const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (options.cookies) {
    Object.entries(options.cookies).forEach(([k, v]) => {
      req.cookies.set(k, v);
    });
  }

  return req;
}

describe('AI API Endpoints Integration Suite', () => {
  it('GET /api/ai/status returns active AI provider and capabilities', async () => {
    const req = createMockRequest('/api/ai/status');
    const res = await getStatus(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBeDefined();
    expect(data.capabilities).toContain('LEAD_EXTRACTION');
    expect(data.capabilities).toContain('SMART_COLUMN_MAPPING');
  });

  it('POST /api/ai/extract/lead extracts leads from raw text', async () => {
    const req = createMockRequest('/api/ai/extract/lead', {
      method: 'POST',
      body: {
        content: 'New Lead: Alex Turner at Hyperion Systems. Email alex@hyperion.com',
      },
    });

    const res = await extractLead(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.leads).toBeInstanceOf(Array);
    expect(data.leads.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/ai/extract/customer extracts customer details from contract', async () => {
    const req = createMockRequest('/api/ai/extract/customer', {
      method: 'POST',
      body: {
        content: 'Master Services Agreement for Starlight Media Group LLC. Contact billing@starlightmedia.com',
      },
    });

    const res = await extractCustomer(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.customers).toBeInstanceOf(Array);
    expect(data.customers.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/ai/map-columns maps raw spreadsheet headers to CRM fields', async () => {
    const req = createMockRequest('/api/ai/map-columns', {
      method: 'POST',
      body: {
        headers: ['Client Name', 'Company Name', 'Email Address', 'Mobile Phone'],
        targetEntity: 'LEAD',
      },
    });

    const res = await mapColumns(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.mappings).toBeInstanceOf(Array);
    expect(data.mappings.length).toBe(4);
  });
});
