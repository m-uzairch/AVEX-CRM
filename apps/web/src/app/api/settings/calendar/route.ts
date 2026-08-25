/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { calendarSettingsSchema } from '@/features/settings/schemas/settings-schemas';

import { CalendarSettings } from '@/features/settings/types/settings-types';

let memoryCalendarSettings: CalendarSettings = {
  defaultView: 'WEEK',
  weekStartDay: 'MONDAY',
  timezone: 'UTC',
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00',
  defaultEventDuration: 30,
  meetingReminders: 15,
};

export async function GET(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);
    return NextResponse.json({ calendar: memoryCalendarSettings });
  } catch (error) {
    console.error('[API GET /api/settings/calendar] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar settings.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);
    const body = await request.json();
    const validated = calendarSettingsSchema.parse(body);

    memoryCalendarSettings = {
      ...memoryCalendarSettings,
      ...validated,
    };

    return NextResponse.json({
      calendar: memoryCalendarSettings,
      message: 'Calendar settings updated successfully.',
    });
  } catch (error: any) {
    console.error('[API PUT /api/settings/calendar] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update calendar settings.' },
      { status: 400 }
    );
  }
}
