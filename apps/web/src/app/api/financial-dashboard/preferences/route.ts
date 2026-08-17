/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { FinancialDashboardService } from '@/features/financial-dashboard/services/financial-dashboard-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr_001';
    const companyId = searchParams.get('companyId') || 'comp_001';

    const preferences = await FinancialDashboardService.getUserPreferences(userId, companyId);
    return NextResponse.json({ preferences });
  } catch (error: any) {
    console.error('[API GET /api/financial-dashboard/preferences] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch preferences.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || 'usr_001';
    const companyId = body.companyId || 'comp_001';

    const preferences = await FinancialDashboardService.saveUserPreferences(
      userId,
      companyId,
      body
    );

    return NextResponse.json({ preferences });
  } catch (error: any) {
    console.error('[API POST /api/financial-dashboard/preferences] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save preferences.' },
      { status: 400 }
    );
  }
}
