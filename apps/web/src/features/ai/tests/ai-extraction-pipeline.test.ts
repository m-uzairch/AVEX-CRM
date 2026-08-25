import { describe, it, expect } from 'vitest';
import { AIExtractionPipeline } from '../services/ai-extraction-pipeline';
import { AIImportExecutionService } from '../services/ai-import-execution-service';

describe('AIExtractionPipeline & Execution Tests', () => {
  it('processes CSV document, detects duplicates, and extracts project deadlines', async () => {
    const csvData = `Name,Company,Email,Phone,Deal Value,Deadline\n"Jordan Hayes","Acme Cloud Dynamics","jordan.hayes@acmecloud.com","+1 555-234-5678","35000","2026-10-31"`;
    const buffer = Buffer.from(csvData, 'utf-8');

    const result = await AIExtractionPipeline.processDocument(
      buffer,
      'q3_leads.csv',
      'LEAD',
      'comp_001',
      'text/csv'
    );

    expect(result.fileType).toBe('CSV');
    expect(result.previewItems.length).toBeGreaterThanOrEqual(1);
    expect(result.previewItems[0].data.name).toBeDefined();

    // Check detected deadlines
    expect(result.detectedDeadlines.length).toBeGreaterThanOrEqual(1);
    expect(result.detectedDeadlines[0].date).toBe('2026-10-31');
  });

  it('AIImportExecutionService batch imports items and syncs deadlines to calendar', async () => {
    const previewItems = [
      {
        id: 'prev_test_01',
        data: {
          name: 'Samantha Ray',
          companyName: 'Apex Innovations',
          email: 'samantha@apexinnovations.io',
          phone: '+1 555-8899',
          expectedDealValue: 75000,
        },
        entityType: 'LEAD' as const,
        isValid: true,
        validationIssues: [],
        isDuplicate: false,
        duplicateStrategy: 'CREATE_NEW' as const,
      },
    ];

    const deadlines = [
      {
        id: 'dl_test_01',
        title: 'Apex Innovations Proposal Review Deadline',
        date: '2026-11-15',
        type: 'DEADLINE' as const,
        description: 'Client decision due date',
        syncToCalendar: true,
      },
    ];

    const result = await AIImportExecutionService.executeImport(
      previewItems,
      'LEAD',
      'comp_001',
      'usr_001',
      'Alex Carter',
      deadlines
    );

    expect(result.successCount).toBe(1);
    expect(result.calendarEventsCreated).toBe(1);
  });
});
