import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as chatWithAssistant } from '@/app/api/ai/assistant/chat/route';
import { GET as getInsights } from '@/app/api/ai/assistant/insights/route';

describe('AI Assistant & Insights API Endpoints Suite', () => {
  it('POST /api/ai/assistant/chat returns conversational answer with references', async () => {
    const req = new NextRequest(new URL('/api/ai/assistant/chat', 'http://localhost:3000'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'How many leads do we have in our sales pipeline?',
      }),
    });

    const res = await chatWithAssistant(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.message).toBeDefined();
    expect(data.message.content).toBeDefined();
    expect(data.intent).toBe('LEADS_QUERY');
    expect(data.references).toBeInstanceOf(Array);
  });

  it('GET /api/ai/assistant/insights returns proactive smart insights', async () => {
    const req = new NextRequest(new URL('/api/ai/assistant/insights', 'http://localhost:3000'));
    const res = await getInsights(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.insights).toBeInstanceOf(Array);
    expect(data.insights.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
  });
});
