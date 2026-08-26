/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { EmployeeService } from '@/features/employees/services/employee-service';
import { employeeStatusUpdateSchema } from '@/features/employees/schemas/employee-schemas';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';

/**
 * PATCH /api/employees/[id]/status
 * Soft deactivate (TERMINATED) or reactivate (ACTIVE) employee (Admin only, company-scoped)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);

    // RBAC: Only Admin / Company Owner can alter employment status
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can alter employment status.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = employeeStatusUpdateSchema.parse(body);

    const updated = await EmployeeService.updateEmployeeStatus(
      auth.companyId,
      id,
      validated.status
    );

    return NextResponse.json({ employee: updated });
  } catch (error: any) {
    console.error('[API PATCH /api/employees/[id]/status] Error:', error);
    const isValidation = error?.name === 'ZodError';
    return NextResponse.json(
      { error: error?.message || 'Failed to update employee status.' },
      { status: isValidation ? 400 : 500 }
    );
  }
}
