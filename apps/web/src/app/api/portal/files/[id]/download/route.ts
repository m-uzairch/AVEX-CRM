/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const { id } = await params;
    const db = prisma as any;

    const file = await db.projectFile.findFirst({
      where: {
        id,
        companyId,
        isClientVisible: true,
        deletedAt: null,
        project: { customerId },
      },
      include: {
        project: { select: { id: true, name: true, projectCode: true } },
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found or you do not have permission to download it.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      downloadUrl: file.fileUrl,
      fileName: file.originalName || file.name,
      fileSize: file.fileSize,
      fileType: file.fileType,
    });
  } catch (error) {
    console.error('[API GET /api/portal/files/[id]/download] Error:', error);
    return NextResponse.json(
      { error: 'Failed to authorize file download.' },
      { status: 500 }
    );
  }
}
