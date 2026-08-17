/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ExpenseService } from '@/features/expenses/services/expense-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const vendors = await ExpenseService.getVendors(companyId);
    return NextResponse.json({ vendors });
  } catch (error: any) {
    console.error('[API GET /api/expenses/vendors] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch vendors.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const createdById = body.createdById || 'usr_001';

    const vendor = await ExpenseService.createVendor(companyId, createdById, body);
    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/expenses/vendors] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create vendor.' },
      { status: 400 }
    );
  }
}
