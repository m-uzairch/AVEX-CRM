/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ExpenseService } from '@/features/expenses/services/expense-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const categories = await ExpenseService.getExpenseCategories(companyId);
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('[API GET /api/expenses/categories] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch categories.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const createdById = body.createdById || 'usr_001';

    const category = await ExpenseService.createExpenseCategory(companyId, createdById, body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/expenses/categories] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create category.' },
      { status: 400 }
    );
  }
}
