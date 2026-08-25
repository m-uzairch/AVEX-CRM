import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { memoryNotifications } from '@/features/notifications/services/notification-store';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const list = memoryNotifications[auth.companyId] || [];

    let count = 0;
    const nowIso = new Date().toISOString();

    list.forEach((n) => {
      if ((n.companyId === auth.companyId || n.userId === auth.userId) && !n.readAt) {
        n.readAt = nowIso;
        count++;
      }
    });

    return NextResponse.json({
      success: true,
      count,
      message: `Marked ${count} notification(s) as read.`,
    });
  } catch (error) {
    console.error('[API POST /api/notifications/mark-all-read] Error:', error);
    return NextResponse.json({ error: 'Failed to mark notifications as read.' }, { status: 500 });
  }
}
