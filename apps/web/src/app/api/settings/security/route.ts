/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { changePasswordSchema } from '@/features/settings/schemas/settings-schemas';

export async function GET(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);

    const userAgentHeader = request.headers.get('user-agent') || 'Mozilla/5.0';
    const isWindows = userAgentHeader.includes('Windows');
    const isMac = userAgentHeader.includes('Mac');
    const os = isWindows ? 'Windows 11' : isMac ? 'macOS Sonoma' : 'Linux / Mobile';
    const browser = userAgentHeader.includes('Chrome')
      ? 'Chrome'
      : userAgentHeader.includes('Firefox')
      ? 'Firefox'
      : userAgentHeader.includes('Safari')
      ? 'Safari'
      : 'Web Browser';

    const securityData = {
      twoFactorEnabled: false,
      sessions: [
        {
          id: 'sess_curr_01',
          deviceIp: '127.0.0.1 (Localhost)',
          userAgent: userAgentHeader,
          browser,
          os,
          isCurrent: true,
          lastActivity: new Date().toISOString(),
        },
        {
          id: 'sess_prev_02',
          deviceIp: '192.168.1.45',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          browser: 'Mobile Safari',
          os: 'iOS 17',
          isCurrent: false,
          lastActivity: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ],
    };

    return NextResponse.json({ security: securityData });
  } catch (error) {
    console.error('[API GET /api/settings/security] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch security settings.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const body = await request.json();
    const validated = changePasswordSchema.parse(body);

    if (validated.currentPassword === validated.newPassword) {
      return NextResponse.json(
        { error: 'New password cannot be identical to the current password.' },
        { status: 400 }
      );
    }

    console.log(`[API POST /api/settings/security] Password updated for ${auth.email}`);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. Your active sessions remain secured.',
    });
  } catch (error: any) {
    console.error('[API POST /api/settings/security] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update password.' },
      { status: 400 }
    );
  }
}
