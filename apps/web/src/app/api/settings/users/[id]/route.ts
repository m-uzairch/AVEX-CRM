/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { memoryUserManagementRecords } from '../route';
import { AuthUserStore } from '@/features/auth/services/auth-user-store';
import { UserRole } from '@/features/rbac/types/rbac-types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const recordIndex = memoryUserManagementRecords.findIndex((u) => u.id === id);
    if (recordIndex === -1) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const current = memoryUserManagementRecords[recordIndex];
    if (current.role === 'COMPANY_OWNER' && body.action === 'toggle-status') {
      return NextResponse.json(
        { error: 'Cannot deactivate the Company Owner account.' },
        { status: 400 }
      );
    }

    if (body.action === 'toggle-status') {
      current.status = current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    }

    if (body.role) {
      const newRole: UserRole = body.role;
      current.role = newRole;

      const memoryUser = AuthUserStore.findUserByEmail(current.email);
      if (memoryUser) {
        memoryUser.role = newRole;
      }
    }

    return NextResponse.json({ user: current });
  } catch (error: any) {
    console.error('[API PATCH /api/settings/users/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update user.' },
      { status: 400 }
    );
  }
}
