import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getAutomations } from '@/app/api/ai/automations/route';
import { POST as runScan } from '@/app/api/ai/automations/run-scan/route';
import { POST as executeAutomation } from '@/app/api/ai/automations/[id]/execute/route';
import { POST as dismissAutomation } from '@/app/api/ai/automations/[id]/dismiss/route';

describe('AI Automations API Endpoints Suite', () => {
  it('GET /api/ai/automations returns active queue and summary KPIs', async () => {
    const req = new NextRequest(new URL('/api/ai/automations', 'http://localhost:3000'));
    const res = await getAutomations(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.items).toBeInstanceOf(Array);
    expect(data.summary).toBeDefined();
  });

  it('POST /api/ai/automations/run-scan triggers full CRM workspace scan', async () => {
    const req = new NextRequest(new URL('/api/ai/automations/run-scan', 'http://localhost:3000'), {
      method: 'POST',
    });

    const res = await runScan(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.totalProposals).toBeGreaterThan(0);
  });

  it('POST /api/ai/automations/[id]/execute executes verified action', async () => {
    const listReq = new NextRequest(new URL('/api/ai/automations', 'http://localhost:3000'));
    const listRes = await getAutomations(listReq);
    const listData = await listRes.json();
    const targetItem = listData.items.find((i: any) => i.status === 'PENDING_APPROVAL') || listData.items[0];

    const req = new NextRequest(new URL(`/api/ai/automations/${targetItem.id}/execute`, 'http://localhost:3000'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customSubject: 'Confirmed Execution Subject',
      }),
    });

    const res = await executeAutomation(req, { params: Promise.resolve({ id: targetItem.id }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.actionId).toBe(targetItem.id);
  });

  it('POST /api/ai/automations/[id]/dismiss dismisses action proposal', async () => {
    const listReq = new NextRequest(new URL('/api/ai/automations', 'http://localhost:3000'));
    const listRes = await getAutomations(listReq);
    const listData = await listRes.json();
    const targetItem = listData.items[0];

    const req = new NextRequest(new URL(`/api/ai/automations/${targetItem.id}/dismiss`, 'http://localhost:3000'), {
      method: 'POST',
    });

    const res = await dismissAutomation(req, { params: Promise.resolve({ id: targetItem.id }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.dismissedId).toBe(targetItem.id);
  });
});
