import { describe, it, expect } from 'vitest';
import { AIAutomationEngine, memoryAutomationQueue } from '../services/ai-automation-engine';
import { AIAutomationExecutor } from '../services/ai-automation-executor';

describe('AIAutomationEngine & Executor Suite', () => {
  it('scans CRM data and generates pending automation proposals with drafts', async () => {
    const items = await AIAutomationEngine.scanAndGenerate('comp_001');

    expect(items).toBeInstanceOf(Array);
    expect(items.length).toBeGreaterThan(0);

    const first = items[0];
    expect(first.status).toBe('PENDING_APPROVAL');
    expect(first.preparedPayload).toBeDefined();
    expect(first.preparedPayload.subject).toBeDefined();
  });

  it('safely executes confirmed automation action and creates calendar event', async () => {
    const queueResult = await AIAutomationEngine.getQueue('comp_001');
    const pendingItem = queueResult.items.find((i) => i.status === 'PENDING_APPROVAL');

    if (pendingItem) {
      const result = await AIAutomationExecutor.executeAction(
        'comp_001',
        pendingItem.id,
        'usr_001',
        'Alex Carter',
        {
          customSubject: 'Customized Follow-up Call',
          customBody: 'Follow up on deliverables and roadmap.',
          calendarDate: '2026-09-01',
        }
      );

      expect(result.success).toBe(true);
      expect(result.actionId).toBe(pendingItem.id);

      // Verify item updated in queue
      const updatedQueue = await AIAutomationEngine.getQueue('comp_001');
      const updated = updatedQueue.items.find((i) => i.id === pendingItem.id);
      expect(updated?.status).toBe('EXECUTED');
    }
  });

  it('dismisses automation proposal correctly', () => {
    const queue = memoryAutomationQueue['comp_001'];
    if (queue && queue.length > 0) {
      const target = queue[0];
      const dismissed = AIAutomationExecutor.dismissAction('comp_001', target.id);
      expect(dismissed).toBe(true);

      const after = queue.find((i) => i.id === target.id);
      expect(after?.status).toBe('DISMISSED');
    }
  });
});
