import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as extractDocument } from '@/app/api/ai/documents/extract/route';
import { POST as confirmImport } from '@/app/api/ai/documents/confirm-import/route';

describe('AI Document & Data Extractor API Suite', () => {
  it('POST /api/ai/documents/extract extracts structured data and deadlines from uploaded CSV', async () => {
    const csvContent = `Name,Company,Email,Phone,Deal Value,Deadline\n"Devon Miles","Knight Enterprise","devon@knight.org","+1 555-0999","40000","2026-09-30"`;
    const formData = new FormData();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    formData.append('file', blob, 'enterprise_leads.csv');
    formData.append('targetEntity', 'LEAD');

    const req = new NextRequest(new URL('/api/ai/documents/extract', 'http://localhost:3000'), {
      method: 'POST',
      body: formData,
    });

    const res = await extractDocument(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.previewItems).toBeInstanceOf(Array);
    expect(data.previewItems.length).toBeGreaterThanOrEqual(1);
    expect(data.detectedDeadlines).toBeInstanceOf(Array);
    expect(data.detectedDeadlines.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/ai/documents/confirm-import persists records and syncs deadlines to calendar', async () => {
    const payload = {
      targetEntity: 'LEAD',
      items: [
        {
          id: 'prev_01',
          data: {
            name: 'Kira Vance',
            companyName: 'Vance Dynamics',
            email: 'kira@vancedynamics.io',
            phone: '+1 555-4321',
          },
          entityType: 'LEAD',
          isValid: true,
          validationIssues: [],
          isDuplicate: false,
          duplicateStrategy: 'CREATE_NEW',
        },
      ],
      deadlinesToSync: [
        {
          id: 'dl_01',
          title: 'Vance Dynamics Contract Start Date',
          date: '2026-09-15',
          type: 'PROJECT_START',
          description: 'Official onboarding start date',
          syncToCalendar: true,
        },
      ],
    };

    const req = new NextRequest(new URL('/api/ai/documents/confirm-import', 'http://localhost:3000'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await confirmImport(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.successCount).toBe(1);
    expect(data.calendarEventsCreated).toBe(1);
  });
});
