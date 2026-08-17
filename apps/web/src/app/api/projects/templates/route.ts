/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { PREDEFINED_TEMPLATES } from '@/features/projects/services/project-automation-service';

export async function GET() {
  try {
    return NextResponse.json({ templates: PREDEFINED_TEMPLATES });
  } catch (error) {
    console.error('[API GET /api/projects/templates] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve project templates.' },
      { status: 500 }
    );
  }
}
