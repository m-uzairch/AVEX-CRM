import { NextResponse, type NextRequest } from 'next/server';
import {
  getSettingsAuthContext,
  settingsForbiddenResponse,
} from '@/features/settings/services/settings-auth-helper';
import { memoryNotifications } from '@/features/notifications/services/notification-store';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { id } = await params;
    const body = await request.json();
    const shouldMarkRead = body.read !== false;

    const list = memoryNotifications[auth.companyId] || [];
    const index = list.findIndex((n) => n.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Notification not found.' }, { status: 404 });
    }

    if (list[index].companyId !== auth.companyId && list[index].userId !== auth.userId) {
      return settingsForbiddenResponse('Access denied: Cannot modify notification belonging to another user.');
    }

    list[index] = {
      ...list[index],
      readAt: shouldMarkRead ? new Date().toISOString() : null,
    };

    return NextResponse.json({
      notification: list[index],
      message: shouldMarkRead ? 'Notification marked as read.' : 'Notification marked as unread.',
    });
  } catch (error) {
    console.error('[API PATCH /api/notifications/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update notification.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { id } = await params;

    const list = memoryNotifications[auth.companyId] || [];
    const index = list.findIndex((n) => n.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Notification not found.' }, { status: 404 });
    }

    if (list[index].companyId !== auth.companyId && list[index].userId !== auth.userId) {
      return settingsForbiddenResponse('Access denied: Cannot delete notification belonging to another user.');
    }

    list.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Notification dismissed successfully.',
    });
  } catch (error) {
    console.error('[API DELETE /api/notifications/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete notification.' }, { status: 500 });
  }
}
