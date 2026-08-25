/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { notificationPreferencesSchema } from '@/features/settings/schemas/settings-schemas';
import { memoryNotificationPreferences } from '@/features/settings/services/settings-store';

export async function GET(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);
    return NextResponse.json({ preferences: memoryNotificationPreferences });
  } catch (error) {
    console.error('[API GET /api/settings/notifications] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch notification preferences.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);
    const body = await request.json();
    const validated = notificationPreferencesSchema.parse(body);

    Object.assign(memoryNotificationPreferences, validated);

    return NextResponse.json({
      preferences: memoryNotificationPreferences,
      message: 'Notification preferences updated successfully.',
    });
  } catch (error: any) {
    console.error('[API PUT /api/settings/notifications] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update notification preferences.' },
      { status: 400 }
    );
  }
}
