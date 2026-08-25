import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { prisma } from '@/lib/database/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // Log user action triggered from insight
    const db = prisma as any;
    try {
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId: auth.companyId,
            action: 'SMART_INSIGHT_ACTION_TRIGGERED',
            module: 'AI_INSIGHTS',
            category: 'AI',
            entityType: body.entityType || 'INSIGHT',
            entityId: id,
            description: `${auth.fullName} triggered action "${body.actionLabel || 'Execute'}" from Smart Insight "${id}".`,
          },
        });
      }
    } catch {
      // Ignore
    }

    return NextResponse.json({
      success: true,
      insightId: id,
      targetUrl: body.url || '/dashboard',
    });
  } catch (error: any) {
    console.error('[API POST /api/ai/insights/[id]/action] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process insight action.' },
      { status: 400 }
    );
  }
}
