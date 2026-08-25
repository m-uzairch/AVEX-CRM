/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { accountSettingsSchema } from '@/features/settings/schemas/settings-schemas';

import { AccountSettings } from '@/features/settings/types/settings-types';

let memoryAccountSettings: AccountSettings = {
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '12h',
  defaultCurrency: 'USD',
};

export async function GET(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);
    return NextResponse.json({ settings: memoryAccountSettings });
  } catch (error) {
    console.error('[API GET /api/settings/account] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch account settings.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);
    const body = await request.json();
    const validated = accountSettingsSchema.parse(body);

    memoryAccountSettings = {
      ...memoryAccountSettings,
      ...validated,
    };

    return NextResponse.json({
      settings: memoryAccountSettings,
      message: 'Account preferences saved successfully.',
    });
  } catch (error: any) {
    console.error('[API PUT /api/settings/account] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update account preferences.' },
      { status: 400 }
    );
  }
}
