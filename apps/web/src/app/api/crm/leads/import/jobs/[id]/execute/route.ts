/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const db = prisma as any;
    const {
      rows = [],
      duplicateStrategy = 'SKIP',
      assignedEmployeeId,
      defaultStatus = 'NEW',
      defaultPriority = 'MEDIUM',
      defaultSource = 'AI File Import',
      tags = ['AI Import'],
    } = body;

    const companyId = 'comp_001';

    let successCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    const errorLog: any[] = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 1;

      // Handle invalid rows
      if (!row.isValid) {
        failedCount++;
        errorLog.push({
          rowId: row.rowId,
          rowNumber: rowNum,
          name: row.name,
          email: row.email,
          error: row.validationError || 'Validation failed for row data',
          suggestedFix: 'Provide a valid email address and fill required fields.',
        });
        continue;
      }

      // Handle duplicates
      if (row.isDuplicate) {
        const rowStrategy = row.duplicateStrategy || duplicateStrategy;

        if (rowStrategy === 'SKIP') {
          duplicateCount++;
          errorLog.push({
            rowId: row.rowId,
            rowNumber: rowNum,
            name: row.name,
            email: row.email,
            error: 'Duplicate record skipped',
            suggestedFix: 'Select UPDATE strategy if you wish to overwrite existing lead data.',
          });
          continue;
        }

        if (rowStrategy === 'UPDATE' && row.duplicateMatchId && db.lead) {
          try {
            await db.lead.update({
              where: { id: row.duplicateMatchId },
              data: {
                name: row.name,
                companyName: row.companyName,
                email: row.email,
                phone: row.phone,
                source: row.source || defaultSource,
                industry: row.industry || null,
                country: row.country || null,
                city: row.city || null,
                address: row.address || null,
                updatedBy: 'AI Import Job',
              },
            });
            successCount++;
            continue;
          } catch {
            // Fallthrough to insert if update fails
          }
        }
      }

      // Create new Lead record
      try {
        if (db.lead) {
          await db.lead.create({
            data: {
              companyId,
              assignedEmployeeId: assignedEmployeeId || null,
              name: row.name,
              companyName: row.companyName,
              email: row.email,
              phone: row.phone,
              source: row.source || defaultSource,
              status: row.status || defaultStatus,
              priority: row.priority || defaultPriority,
              score: row.score ?? 50,
              industry: row.industry || null,
              country: row.country || null,
              city: row.city || null,
              address: row.address || null,
              postalCode: row.postalCode || null,
              website: row.website || null,
              expectedDealValue: row.expectedDealValue || 0,
              tags: Array.from(new Set([...(row.tags || []), ...tags])),
              createdBy: 'AI Import Job',
              updatedBy: 'AI Import Job',
            },
          });
        }
        successCount++;
      } catch (err: any) {
        failedCount++;
        errorLog.push({
          rowId: row.rowId,
          rowNumber: rowNum,
          name: row.name,
          email: row.email,
          error: err?.message || 'Database write error',
          suggestedFix: 'Ensure lead properties do not violate constraints.',
        });
      }
    }

    // Update ImportJob status & counters
    let updatedJob: any;
    if (db.importJob) {
      updatedJob = await db.importJob.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          successCount,
          duplicateCount,
          failedCount,
          errorLog,
          completedAt: new Date(),
        },
      });
    } else {
      updatedJob = {
        id,
        status: 'COMPLETED',
        totalRecords: rows.length,
        successCount,
        duplicateCount,
        failedCount,
        errorLog,
        completedAt: new Date().toISOString(),
      };
    }

    // Log ActivityLog audit entry
    try {
      if (db.activityLog) {
        await db.activityLog.create({
          data: {
            companyId,
            action: 'LEAD_IMPORT_COMPLETED',
            module: 'CRM',
            description: `AI Lead Import completed for Job #${id}: ${successCount} imported, ${duplicateCount} duplicates, ${failedCount} failed`,
          },
        });
      }
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: `Batch import executed: ${successCount} leads imported successfully.`,
    });
  } catch (error: any) {
    console.error('[API POST /api/crm/leads/import/jobs/[id]/execute] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute import job.' },
      { status: 500 }
    );
  }
}
