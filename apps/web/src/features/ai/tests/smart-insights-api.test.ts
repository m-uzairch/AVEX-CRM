import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getInsights } from '@/app/api/ai/insights/route';
import { POST as dismissInsight } from '@/app/api/ai/insights/[id]/dismiss/route';
import { POST as actionInsight } from '@/app/api/ai/insights/[id]/action/route';

describe('Smart Insights API Endpoints Suite', () => {
  it('GET /api/ai/insights returns filtered insights and summary KPIs', async () => {
    const req = new NextRequest(new URL('/api/ai/insights?category=ALL&priority=ALL', 'http://localhost:3000'));
    const res = await getInsights(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.insights).toBeInstanceOf(Array);
    expect(data.summary).toBeDefined();
    expect(data.summary.totalActive).toBeGreaterThan(0);
  });

  it('POST /api/ai/insights/[id]/dismiss dismisses an insight', async () => {
    const req = new NextRequest(new URL('/api/ai/insights/ins_test_01/dismiss', 'http://localhost:3000'), {
      method: 'POST',
    });

    const res = await dismissInsight(req, { params: Promise.resolve({ id: 'ins_test_01' }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.dismissedId).toBe('ins_test_01');
  });

  it('POST /api/ai/insights/[id]/action tracks action trigger', async () => {
    const req = new NextRequest(new URL('/api/ai/insights/ins_test_01/action', 'http://localhost:3000'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionLabel: 'Send Reminders',
        url: '/invoices',
        entityType: 'INVOICE',
      }),
    });

    const res = await actionInsight(req, { params: Promise.resolve({ id: 'ins_test_01' }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.targetUrl).toBe('/invoices');
  });
});
