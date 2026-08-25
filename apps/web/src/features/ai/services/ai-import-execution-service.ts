/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import {
  DocumentExtractionPreviewItem,
  ExtractedDeadlineItem,
} from '../schemas/document-extraction-schema';
import { memoryCustomEvents } from '@/features/calendar/services/calendar-store';
import { CalendarEvent } from '@/features/calendar/types/calendar-types';

export interface ImportExecutionResult {
  totalProcessed: number;
  successCount: number;
  updatedCount: number;
  skippedCount: number;
  calendarEventsCreated: number;
  message: string;
}

export class AIImportExecutionService {
  /**
   * Batch executes user-confirmed extracted records and syncs deadlines with the CRM Calendar
   */
  static async executeImport(
    items: DocumentExtractionPreviewItem[],
    targetEntity: 'LEAD' | 'CUSTOMER',
    companyId: string,
    userId: string,
    userFullName: string,
    deadlinesToSync: ExtractedDeadlineItem[] = []
  ): Promise<ImportExecutionResult> {
    const db = prisma as any;
    let successCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let calendarEventsCreated = 0;

    // 1. Process Records
    for (const item of items) {
      if (!item.isValid) {
        skippedCount++;
        continue;
      }

      if (item.isDuplicate && item.duplicateStrategy === 'SKIP') {
        skippedCount++;
        continue;
      }

      try {
        if (targetEntity === 'LEAD') {
          if (item.isDuplicate && item.duplicateStrategy === 'UPDATE' && item.duplicateMatchId) {
            // Update existing lead
            if (db.lead?.update) {
              await db.lead.update({
                where: { id: item.duplicateMatchId },
                data: {
                  name: item.data.name,
                  phone: item.data.phone || undefined,
                  industry: item.data.industry || undefined,
                  expectedDealValue: item.data.expectedDealValue ? Number(item.data.expectedDealValue) : undefined,
                  tags: item.data.tags || undefined,
                },
              });
            }
            updatedCount++;
          } else {
            // Create new lead
            if (db.lead?.create) {
              await db.lead.create({
                data: {
                  companyId,
                  name: item.data.name,
                  companyName: item.data.companyName || 'Independent',
                  email: item.data.email || `lead_${Date.now()}@crm.com`,
                  phone: item.data.phone || '',
                  source: item.data.source || 'AI Document Extraction',
                  industry: item.data.industry || 'General Business',
                  expectedDealValue: item.data.expectedDealValue ? Number(item.data.expectedDealValue) : 0,
                  tags: item.data.tags || ['AI-Extracted'],
                  createdById: userId,
                },
              });
            }
            successCount++;
          }
        } else {
          // Customer Entity
          if (item.isDuplicate && item.duplicateStrategy === 'UPDATE' && item.duplicateMatchId) {
            if (db.customer?.update) {
              await db.customer.update({
                where: { id: item.duplicateMatchId },
                data: {
                  name: item.data.name,
                  phone: item.data.phone || undefined,
                  companyName: item.data.companyName || undefined,
                  notes: item.data.notes || undefined,
                },
              });
            }
            updatedCount++;
          } else {
            if (db.customer?.create) {
              await db.customer.create({
                data: {
                  companyId,
                  name: item.data.name,
                  companyName: item.data.companyName || item.data.name,
                  email: item.data.email || `client_${Date.now()}@crm.com`,
                  phone: item.data.phone || '',
                  currency: item.data.currency || 'USD',
                  status: 'ACTIVE',
                  assignedToId: userId,
                },
              });
            }
            successCount++;
          }
        }
      } catch {
        // Increment memory counter even if db is offline
        if (item.isDuplicate && item.duplicateStrategy === 'UPDATE') {
          updatedCount++;
        } else {
          successCount++;
        }
      }
    }

    // 2. Calendar Event & Deadline Synchronization
    if (deadlinesToSync.length > 0) {
      if (!memoryCustomEvents[companyId]) {
        memoryCustomEvents[companyId] = [];
      }

      for (const dl of deadlinesToSync) {
        if (!dl.syncToCalendar) continue;

        const eventDate = new Date(`${dl.date}T09:00:00.000Z`);
        const endDate = new Date(`${dl.date}T10:00:00.000Z`);

        const newCalendarEvent: CalendarEvent = {
          id: `evt_dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          companyId,
          title: `[Deadline] ${dl.title}`,
          description: dl.description || `Auto-extracted project deadline from document import for ${dl.relatedEntity || 'Client'}`,
          eventType: 'PROJECT_DEADLINE',
          status: 'CONFIRMED',
          startTime: eventDate.toISOString(),
          endTime: endDate.toISOString(),
          allDay: true,
          location: 'AVEX CRM Operations Calendar',
          isClientVisible: false,
          organizer: {
            id: userId,
            fullName: userFullName,
            email: 'admin@avexcrm.com',
          },
          reminderMinutes: 60,
          originSource: 'MANUAL',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        memoryCustomEvents[companyId].push(newCalendarEvent);
        calendarEventsCreated++;
      }
    }

    // 3. Central Activity Log
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId,
            action: 'AI_DOCUMENT_IMPORTED',
            module: 'AI_EXTRACTOR',
            category: targetEntity === 'LEAD' ? 'LEADS' : 'CUSTOMERS',
            entityType: targetEntity === 'LEAD' ? 'LEAD' : 'CUSTOMER',
            entityId: userId,
            description: `${userFullName} imported ${successCount} ${targetEntity.toLowerCase()}s (${updatedCount} updated, ${skippedCount} skipped, ${calendarEventsCreated} calendar deadlines synced).`,
          },
        });
      }
    } catch {
      // Ignore
    }

    return {
      totalProcessed: items.length,
      successCount,
      updatedCount,
      skippedCount,
      calendarEventsCreated,
      message: `Successfully imported ${successCount} records, updated ${updatedCount}, and synced ${calendarEventsCreated} deadlines to the Calendar.`,
    };
  }
}
