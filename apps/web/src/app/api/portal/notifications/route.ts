/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';

export async function GET(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    // Return system and project updates for this client
    const notifications = [
      {
        id: 'notif_1',
        title: 'Project Milestone Reached',
        message: 'Sprint review deliverables uploaded to your portal.',
        type: 'SUCCESS',
        isRead: false,
        link: '/portal/projects',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif_2',
        title: 'New Invoice Issued',
        message: 'A new invoice is available for your review.',
        type: 'INFO',
        isRead: false,
        link: '/portal/invoices',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'notif_3',
        title: 'Meeting Scheduled',
        message: 'Upcoming Sprint Review session confirmed.',
        type: 'INFO',
        isRead: true,
        link: '/portal/meetings',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('[API GET /api/portal/notifications] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications.' },
      { status: 500 }
    );
  }
}
