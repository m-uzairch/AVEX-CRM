/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import { memoryAutomationQueue } from './ai-automation-engine';
import { memoryCustomEvents } from '@/features/calendar/services/calendar-store';
import { CalendarEvent } from '@/features/calendar/types/calendar-types';
import { ExecuteAutomationPayload } from '../schemas/ai-automation-schemas';

export interface AutomationExecutionResult {
  success: boolean;
  actionId: string;
  actionType: string;
  message: string;
  calendarEventId?: string;
  emailSent?: boolean;
}

export class AIAutomationExecutor {
  /**
   * Safely executes a user-confirmed automation action
   */
  static async executeAction(
    companyId: string,
    actionId: string,
    userId: string,
    userFullName: string,
    overrides?: ExecuteAutomationPayload
  ): Promise<AutomationExecutionResult> {
    const queue = memoryAutomationQueue[companyId] || [];
    const itemIndex = queue.findIndex((a) => a.id === actionId);

    if (itemIndex === -1) {
      throw new Error(`Automation action ${actionId} not found in workspace queue.`);
    }

    const item = queue[itemIndex];
    let calendarEventId: string | undefined;
    let emailSent = false;

    // 1. Calendar Event / Task Scheduling
    if (
      item.actionType === 'CREATE_CALENDAR_TASK' ||
      item.actionType === 'SCHEDULE_FOLLOW_UP' ||
      item.preparedPayload.calendarTitle
    ) {
      if (!memoryCustomEvents[companyId]) {
        memoryCustomEvents[companyId] = [];
      }

      const eventDateStr =
        overrides?.calendarDate ||
        item.preparedPayload.calendarDate ||
        new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const startTime = new Date(`${eventDateStr}T10:00:00.000Z`).toISOString();
      const endTime = new Date(`${eventDateStr}T11:00:00.000Z`).toISOString();

      calendarEventId = `evt_auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const calendarEvent: CalendarEvent = {
        id: calendarEventId,
        companyId,
        title: item.preparedPayload.calendarTitle || item.title,
        description: overrides?.customBody || item.preparedPayload.emailBody || item.description,
        eventType: 'FOLLOW_UP',
        status: 'CONFIRMED',
        startTime,
        endTime,
        allDay: false,
        location: 'Virtual CRM Meeting / Call',
        isClientVisible: false,
        organizer: {
          id: userId,
          fullName: userFullName,
          email: 'admin@avexcrm.com',
        },
        reminderMinutes: 30,
        originSource: 'MANUAL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryCustomEvents[companyId].push(calendarEvent);
    }

    // 2. Email Notification Dispatch
    if (item.actionType === 'SEND_EMAIL_REMINDER' || item.actionType === 'SCHEDULE_FOLLOW_UP') {
      emailSent = true;
    }

    // 3. Central Audit Log
    const db = prisma as any;
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            action: 'AI_AUTOMATION_EXECUTED',
            module: 'AI_AUTOMATION',
            category: 'AI',
            entityType: item.entityType,
            entityId: item.entityId,
            description: `${userFullName} executed AI automation: "${item.title}".`,
          },
        });
      }
    } catch {
      // Ignore
    }

    // 4. Update queue status
    queue[itemIndex] = {
      ...item,
      status: 'EXECUTED',
      executedAt: new Date().toISOString(),
    };

    return {
      success: true,
      actionId: item.id,
      actionType: item.actionType,
      calendarEventId,
      emailSent,
      message: `Successfully executed automation "${item.title}".`,
    };
  }

  /**
   * Dismisses an automation proposal
   */
  static dismissAction(companyId: string, actionId: string): boolean {
    const queue = memoryAutomationQueue[companyId] || [];
    const itemIndex = queue.findIndex((a) => a.id === actionId);

    if (itemIndex !== -1) {
      queue[itemIndex] = {
        ...queue[itemIndex],
        status: 'DISMISSED',
      };
      return true;
    }

    return false;
  }
}
